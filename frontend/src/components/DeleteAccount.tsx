import React from 'react'
import { useMutation } from '@apollo/client'

import { Button, createStyles, makeStyles } from '@material-ui/core'
import { DELETE_USER } from '../graphql/mutations'
import { UserType } from '../types'
import useSaveDialog from '../hooks/useSaveDialog'
import PromptDialog from './PromptDialog'

interface Props {
  user: UserType | undefined
}

const DeleteAccount = ({ user }: Props) => {

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
    <div >
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
    },
  })
)

export default DeleteAccount