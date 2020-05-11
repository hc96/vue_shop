<template>
  <div class="login_container">
    <!--
          Login Component
    -->
    <div class="login_box">
      <!-- logo -->
      <div class="logo_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- login -->
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- username -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- password -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- buttons -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">Login</el-button>
          <el-button type="info" @click="resetForm">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: 'Please enter the username name.', trigger: 'blur' },
          { min: 3, max: 10, message: 'the password shoud not be less than 3 or longer than 10 letters', trigger: 'blur' }
        ],
        password: [{ required: true, message: 'Please enter the password.', trigger: 'blur' }, { min: 6, max: 16, message: 'the password shoud not be less than 6 or longer than 16 letters', trigger: 'blur' }]
      }

    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('failed to login')
        this.$message.success('succeed to login')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    resetForm () {
      console.log('reset the form')
      this.$refs.loginFormRef.resetFields()
    }
  }

}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: white;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  //   another way to make the box in the center
  //   top: 0;
  //   bottom: 0;
  //   left: 0;
  //   right: 0;
  //   margin: auto;
}

.logo_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  //   background-color: white;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login_form {
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
