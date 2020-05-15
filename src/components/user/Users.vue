<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <div slot="header">
        <!-- search -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="queryInfo.query"
              placeholder="Please enter..."
              clearable
              @clear="getUserList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="dialogVisible=true">Add User</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Username" prop="username"></el-table-column>
        <el-table-column label="Email" prop="email"></el-table-column>
        <el-table-column label="Mobile" prop="mobile"></el-table-column>
        <el-table-column label="Role" prop="role_name"></el-table-column>
        <el-table-column label="State">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Operations" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="role assignment" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 2, 4, 8]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      ></el-pagination>
    </el-card>

    <!-- Dialog for adding users -->
    <el-dialog
      title="Add User"
      :visible.sync="dialogVisible"
      width="35%"
      @close="addDialogClosed()"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="E-mail" prop="email">
          <el-input type="email" v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="Mobile" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="addUser">Confirm</el-button>
    </el-dialog>

    <!-- dialog for editting user -->
    <el-dialog
      title="Edit User"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="email" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="mobile" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editUser">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // validation
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/

      if (regEmail.test(value)) {
        return callback()
      }

      callback(new Error('please enter the valid email address'))
    }

    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return callback()
      }

      callback(new Error('please enter the valid mobile number'))
    }

    return {
      userList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: 'the username cannot be empty', trigger: 'blur' },
          { min: 3, max: 6, message: 'the length of username should be between 3 and 6', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'the password cannot be empty', trigger: 'blur' },
          { min: 6, max: 15, message: 'the length of password should be between 6 and 15', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'the email cannot be empty', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: 'the mobile cannot be empty', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: 'the email cannot be empty', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: 'the mobile cannot be empty', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {}
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(res)
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('failed to update user state')
      }
      this.$message.success('succeed to update user state')
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('failed to add user')
        }

        this.$message.success('succeed to add user')

        this.dialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('failed to get the user information')
      }

      this.editForm = res.data

      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          this.$message.error('failed to edit user information')
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('succeed to edit user information')
      })
    },
    async removeUserById (id) {
      // confirm box for asking user if delete
      const confirmResult = await this.$confirm('this operation will delete the user, are you sure to proceed?', 'Hint', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('you canceled the deleteing')
      } else {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('failed to delete the user')
        }

        this.$message.success('succeed to delete the user')
        this.getUserList()
      }
    }
  }

}
</script>

<style scoped>
</style>
