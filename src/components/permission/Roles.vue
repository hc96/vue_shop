<template>
  <div>
    <!-- breadcrumb -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- card -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">Add Role</el-button>
        </el-col>
      </el-row>

      <!-- roles -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', 'vcenter',index1 === 0 ? 'bdtop':'']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[index2 === 0 ? '':'bdtop', 'vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Roles" prop="roleName"></el-table-column>
        <el-table-column label="Description" prop="roleDesc"></el-table-column>
        <el-table-column label="Operation" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">edit</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">delete</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showAssignRights(scope.row)"
            >assign</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- dialog for assigning -->
    <el-dialog
      title="Hints"
      :visible.sync="assignVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        :data="rightsList"
        :props="treeProps"
        ref="keyRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">Cancel</el-button>
        <el-button type="primary" @click="assignRights">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      assignVisible: false,
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('failed to get the role list')
      }

      this.roleList = res.data
    },
    async removeRightById (role, id) {
      const returnResult = await this.$confirm('this operation will delete the right, are you sure to proceed?', 'Hint', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)

      if (returnResult !== 'confirm') {
        return this.$message.info('you just canceled')
      }

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('failed to delete the right')
      }

      role.children = res.data
    },
    async showAssignRights (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        this.$message.error('failed to get the rights data')
      }

      this.rightsList = res.data

      this.getLeafKeys(role, this.defKeys)

      this.assignVisible = true
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(element => {
        this.getLeafKeys(element, arr)
      })
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    async assignRights () {
      const keys = [
        ...this.$refs.keyRef.getCheckedKeys(),
        ...this.$refs.keyRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })

      if (res.meta.status !== 200) {
        return this.$message.error('failed to assign rights')
      }

      this.$message.success('succeed to assign rights')
      this.getRoleList()
      this.assignVisible = false
    }
  }

}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid black;
}

.bdbottom {
  border-bottom: 1px solid black;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
