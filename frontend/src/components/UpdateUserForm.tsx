import React, { useState } from 'react'
import { Formik, Form, FormikProps } from 'formik'
import {
  Grid,
  TextField,
  Button,
  makeStyles,
  createStyles,
} from '@material-ui/core'
import { useMutation } from '@apollo/client'
import { UPDATE_USER } from '../graphql/mutations'
import { UserType } from '../types'
import { ME } from '../graphql/queries'
import UpdateSchema from './UpdateSchema'

const stylesInUse = makeStyles((theme) =>
  createStyles({
    root: {
      maxWidth: '500px',
      display: 'block',
      margin: '0 auto',
    },
    textField: {
      '& > *': {
        width: '100%',
      },
    },
    registerButton: {
      marginTop: '30px',
    },
    title: { textAlign: 'left' },
    successMessage: { color: theme.palette.success.main },
    errorMessage: { color: theme.palette.error.main },
  })
)

interface Props {
  user: UserType
}

interface MyFormStatus {
  type: string
  message: string
}

interface MyFormStatusProps {
  [key: string]: MyFormStatus
}

interface MyUpdateForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const formStatusProps: MyFormStatusProps = {
  error: {
    message: 'Update failed. Please try again.',
    type: 'error',
  },
  success: {
    message: 'Updated successfully.',
    type: 'success',
  },
  duplicate: {
    message: 'Username already exists.',
    type: 'error',
  },
}

const UpdateUserForm = ({ user }: Props) => {
  const [formStatus, setFormStatus] = useState<MyFormStatus>({
    message: '',
    type: '',
  })
  const classes = stylesInUse()
  const [showFormStatus, setShowFormStatus] = useState(false)

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: ME }],
  })

  const updateAccount = async (data: MyUpdateForm, resetForm: Function) => {
    try {
      const updateResponse = await updateUser({
        variables: {
          username: user.username,
          newUsername: data.username === '' ? undefined : data.username,
          newEmail: data.email === '' ? undefined : data.email,
          newPassword: data.password === '' ? undefined : data.password,
        },
      })
      localStorage.setItem(
        'amandus-user-access-token',
        updateResponse.data.updateUser.accessToken
      )
      localStorage.setItem(
        'amandus-user-refresh-token',
        updateResponse.data.updateUser.refreshToken
      )
      setFormStatus(formStatusProps.success)
    } catch (error) {
      if (
        /** gets rid of ts error "Object is of type 'unknown'" */
        error instanceof Error &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        setFormStatus(formStatusProps.duplicate)
      } else {
        setFormStatus(formStatusProps.error)
      }
    }
    resetForm({})
    setShowFormStatus(true)
  }

  const UserSchema = UpdateSchema

  return (
    <div className={classes.root}>
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        onSubmit={(values: MyUpdateForm, actions) => {
          updateAccount(values, actions.resetForm)
          setTimeout(() => {
            actions.setSubmitting(false)
          }, 400)
        }}
        validationSchema={UserSchema}
      >
        {(props: FormikProps<MyUpdateForm>) => {
          const {
            handleBlur,
            handleChange,
            values,
            isSubmitting,
            touched,
            errors,
          } = props

          return (
            <Form>
              <Grid container direction="row">
                <Grid item className={classes.title} xs={12}>
                  <h1>Update credentials for user: {user.username}</h1>
                </Grid>

                <Grid item className={classes.textField} xs={8}>
                  <TextField
                    id="username"
                    name="username"
                    type="text"
                    label="Username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={
                      touched.username && errors.username
                        ? errors.username
                        : 'Enter new username to update.'
                    }
                    error={touched.username && errors.username ? true : false}
                  />
                </Grid>
                <Grid item className={classes.textField} xs={8}>
                  {' '}
                  <TextField
                    id="email"
                    name="email"
                    type="text"
                    label="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={
                      touched.email && errors.email
                        ? errors.email
                        : 'Enter new email address to update.'
                    }
                    error={touched.email && errors.email ? true : false}
                  />
                </Grid>

                <Grid item className={classes.textField} xs={8}>
                  <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={
                      touched.password && errors.password
                        ? 'Make sure your password is minimum of 8 characters long and consists of at least 1 uppercase, lowercase, number and one special ' +
                        'character from !?@#$%^&*(). Password cannot end with an empty space.'
                        : 'Valid password is minimum of 8 characters long and consists of at least 1 uppercase, lowercase, number and one special ' +
                        'character from !?@#$%^&*(). Password cannot end with an empty space.'
                    }
                    error={touched.password && errors.password ? true : false}
                  />
                </Grid>

                <Grid item className={classes.textField} xs={8}>
                  <TextField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                        ? 'Your confirmation did not match with your password. Please try again.'
                        : 'Re-write your password to confirm it.'
                    }
                    error={
                      touched.confirmPassword && errors.confirmPassword
                        ? true
                        : false
                    }
                  />
                </Grid>

                <Grid item className={classes.registerButton} xs={6}>
                  <Button
                    id="update-button"
                    className="update-button"
                    color="primary"
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {' '}
                    Update
                  </Button>
                  {showFormStatus && (
                    <div className="formStatus">
                      {formStatus.type === 'success' ? (
                        <p className={classes.successMessage}>
                          {formStatus.message}
                        </p>
                      ) : formStatus.type === 'error' ? (
                        <p className={classes.errorMessage}>
                          {formStatus.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                </Grid>
              </Grid>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default UpdateUserForm
