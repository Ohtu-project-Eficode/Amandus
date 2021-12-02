import * as Yup from 'yup'

const RegisterSchema = () => {
  return Yup.object().shape({
    email: Yup.string().email(),
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters long.')
      .max(50, 'Username can be maximum 50 characters long.'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long.')
      .matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!?@#$%^&*()]).{7,30}\S$/
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords must match.')
  })
}

export default RegisterSchema
