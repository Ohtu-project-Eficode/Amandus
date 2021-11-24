import { Snackbar } from '@material-ui/core'

import { Alert } from '@material-ui/lab'
import React from 'react'
import { useNotification } from './NotificationProvider'

const Notification = () => {
  const { notification, handleClose, autoHideDelay } = useNotification()

  if (!notification) {
    return null
  }
  return (
    <Snackbar
      open={true}
      onClose={handleClose}
      autoHideDuration={autoHideDelay}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Alert
        severity={notification.isError ? 'error' : 'success'}
        onClose={handleClose}
      >
        {notification.text}
      </Alert>
    </Snackbar>
  )
}

export default Notification
