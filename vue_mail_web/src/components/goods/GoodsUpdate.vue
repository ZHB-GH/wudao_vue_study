<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="修改商品信息" type="info" center :closable="false" show-icon> </el-alert>
      <!-- 进度条 -->
      <el-steps :active="Number(activeIndex)" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeaveTab" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="updateForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="updateForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="updateForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="updateForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="updateForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableList" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableList" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :file-list="updateForm.pics.pics_sma"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="updateForm.goods_introduce" />
            <el-button type="primary" class="btnClass" @click="updateGoods">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="30%">
      <img :src="previewURL" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  created() {
    this.getGoodsInfo()
    this.getCateList()
  },
  data() {
    return {
      activeIndex: 0,
      updateForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      updateFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品类别', trigger: 'blur' }],
      },
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      manyTableList: [],
      onlyTableList: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headersObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      previewURL: '',
      previewDialogVisible: false,
    }
  },
  computed: {
    cateId() {
      if (this.updateForm.goods_cat.length === 3) {
        return this.updateForm.goods_cat[this.updateForm.goods_cat.length - 1]
      }
      return null
    },
  },
  methods: {
    async getGoodsInfo() {
      const { data: res } = await this.$http.get(`goods/${this.$route.params.id}`)
      if (res.meta.status !== 200) {
        this.$message.error('获取商品信息失败')
      }
      console.log(res.data)
      // 数据处理
      res.data.goods_cat = res.data.goods_cat !== null && res.data.goods_cat.length > 0 ? res.data.goods_cat.split(',').map(Number) : []
      const tmp = []
      res.data.pics.forEach((item) => {
        tmp.push({
          url: item.pics_sma,
        })
      })
      res.data.pics = tmp
      this.updateForm = res.data
    },
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    handleChange() {
      if (this.updateForm.goods_cat.length !== 3) {
        this.updateForm.goods_cat = []
        this.$message.warning('需要三级分类！')
      }
    },
    beforeLeaveTab(activeName, oldName) {
      if (oldName === '0' && this.updateForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many',
          },
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        // 处理标签数组
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableList = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only',
          },
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取属性列表失败')
        }
        this.onlyTableList = res.data
      }
    },
    handlePreview(file) {
      this.previewURL = file.response.data.url
      this.previewDialogVisible = true
    },
    handleRemove(file) {
      // 找到临时图片的路径名称
      const tmpName = file.response.data.tmp_path
      // 数组查找对呀下标
      const index = this.updateForm.pics.findIndex((t) => {
        t.tmp_path === tmpName
      })
      // 移除临时图片
      this.updateForm.pics.splice(index, 1)
      console.log(this.updateForm)
    },
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.updateForm.pics.push(picInfo)
    },
    updateGoods() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 拷贝对象避免数据处理出错
        const form = _.cloneDeep(this.updateForm)
        form.goods_cat = form.goods_cat.join(',')
        // 添加动态参数和静态属性
        this.manyTableList.forEach((item) => {
          const info = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals.join(' '),
          }
          form.attrs.push(info)
        })

        this.onlyTableList.forEach((item) => {
          const info = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals,
          }
          form.attrs.push(info)
        })
        console.log(form)
        const { data: res } = await this.$http.put(`goods/${form.goods_id}`, {
          goods_name: form.goods_name,
          goods_cat: form.goods_cat,
          goods_price: form.goods_price,
          goods_number: form.goods_number,
          goods_weight: form.goods_weight,
          goods_introduce: form.goods_introduce,
          pics: form.pics,
          attrs: form.attrs,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品失败！')
        }
        this.$message.success('修改商品成功')
        this.$router.push('/goods')
      })
    },
  },
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnClass {
  margin-top: 15px;
}
</style>