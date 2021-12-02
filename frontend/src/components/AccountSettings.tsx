import React from 'react'
import { useMutation } from '@apollo/client'

import { Button, createStyles, makeStyles } from '@material-ui/core'
import { DELETE_USER } from '../graphql/mutations'
import { UserType } from '../types'
import useSaveDialog from '../hooks/useSaveDialog'
import PromptDialog from './PromptDialog'
import UpdateUserForm from './UpdateUserForm'

interface Props {
  user: UserType | undefined
}

const AccountSettings = ({ user }: Props) => {

  const [deleteUser] = useMutation(DELETE_USER)

  const {
    dialogOpen,
    handleDialogClose,
    handleDialogOpen,
  } = useSaveDialog()

  const handleDeleteClick = () => {
    handleDialogOpen()
  }

  const classes = stylesInUse()

  const deleteUserAccount = async () => {
    try {
      await deleteUser({
        variables: {
          username: user?.username
        }
      })
      localStorage.clear()
      window.location.href = '/'
      handleDialogClose()
    }
    catch (e) {
      console.log(e)
    }
  }

  return (
    <div className={classes.root}>
      {user && <UpdateUserForm user={user} />}
      <PromptDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleSubmit={deleteUserAccount}
        dialogTitle={'By confirming your account will be deleted irreversibly'}
      />
      <Button
        id="delete-button"
        name="delete-button"
        className={classes.deleteButton}
        color="primary"
        variant="contained"
        onClick={handleDeleteClick}
      >
        Delete Account
      </Button>
    </div>
  )
}

const stylesInUse = makeStyles(() =>
  createStyles({
    deleteButton: {
      backgroundColor: 'red',
      margin:  '25px 0px 15px 0px'
    },
    root: {
      maxWidth: '500px',
      display: 'block',
      margin: '0 auto',
    },
  })
)

export default AccountSettings