<!-- roles -->
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 角色列表展示 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoleDialogVisible">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 角色权限展开 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 一级权限 -->
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdBottom', 'vcenter', i1 === 0 ? 'bdTop' : '']">
              <el-col :span="5"
                ><el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag> <i class="el-icon-caret-right"></i
              ></el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 !== 0 ? 'bdTop' : '', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="getRoleById(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightsDialogVisible(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setResetRightDialogVisible">
      <el-tree :data="rightsTreeList" :props="rightsProps" :default-checked-keys="defKeys" node-key="id" ref="rightsRef" show-checkbox default-expand-all></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @closed="closeAddDialogVisible">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色 -->
    <el-dialog title="修改角色" :visible.sync="updateRoleDialogVisible" width="50%" @closed="closeUpdateDialogVisible">
      <el-form :model="updateRoleForm" :rules="updateRoleFormRules" ref="updateRoleFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="updateRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="updateRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightsTreeList: [],
      rightsProps: {
        children: 'children',
        label: 'authName',
      },
      defKeys: [],
      roleId: '',
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      addRoleFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
      },
      updateRoleForm: {},
      updateRoleDialogVisible: false,
      updateRoleFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
      },
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
    },
    async removeRightById(role, rightId) {
      const confirmRemove = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)

      if (confirmRemove !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      this.$message.success('删除权限成功')
      role.children = res.data
    },
    // 显示分配权限
    showRightsDialogVisible(rights) {
      this.roleId = rights.id
      this.getRightsTreeList()
      this.setRightDialogVisible = true
      this.getLeveKeys(rights, this.defKeys)
    },
    // 获取树形权限列表
    async getRightsTreeList() {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      }
      this.rightsTreeList = res.data
    },
    // 递归获取所有的已选择的节点
    getLeveKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果存在子集合就遍历子集合
      node.children.forEach((item) => {
        this.getLeveKeys(item, arr)
      })
    },
    // 重置已经选中节点
    setResetRightDialogVisible() {
      this.defKeys = []
    },
    async updateRights() {
      const ridsArr = [...this.$refs.rightsRef.getHalfCheckedKeys(), ...this.$refs.rightsRef.getCheckedKeys()]
      const ridsStr = ridsArr.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: ridsStr,
      })

      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败!')
      }

      this.$message.success('更新权限成功')
      this.setRightDialogVisible = false
      this.getRolesList()
    },
    showAddRoleDialogVisible() {
      this.addRoleDialogVisible = true
    },
    closeAddDialogVisible() {
      this.$refs.addRoleFormRef.resetFields()
    },
    addRole() {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        this.$message.success('添加角色成功!')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
    updateRole() {
      this.$refs.updateRoleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.updateRoleForm.roleId}`, this.updateRoleForm)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色失败!')
        }
        this.$message.success('编辑角色成功!')
        this.updateRoleDialogVisible = false
        this.getRolesList()
      })
    },
    async getRoleById(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败!')
      }
      this.updateRoleForm = res.data
      this.updateRoleDialogVisible = true
    },
    closeUpdateDialogVisible() {
      this.$refs.updateRoleFormRef.resetFields()
    },
    async deleteRoleById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      this.$message.success('删除角色成功!')
      this.getRolesList()
    },
  },
}
</script>
<style rel="stylesheet/less" lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdTop {
  border-top: 1px solid #eee;
}

.bdBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>