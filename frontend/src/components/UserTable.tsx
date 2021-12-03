import React, { useState } from 'react'
import Checkbox from '@mui/material/Checkbox'
import { MTableBodyRow } from '@material-table/core'
import MaterialTable from '@material-table/core'
import { useMutation } from '@apollo/client'
import { DELETE_USER, UPDATE_USER } from '../graphql/mutations'

const UserTable = ({ users }: any) => {
  const [data, setData] = useState(users)

  const [updateUser] = useMutation(UPDATE_USER)
  const [deleteUser] = useMutation(DELETE_USER)

  return (
    <MaterialTable
      title="Amandus users"
      components={{
        Row: (props) => <MTableBodyRow id={props.index} {...props} />,
      }}
      columns={[
        { title: 'Id', field: 'id', editable: 'never' },
        { title: 'Username', field: 'username', editable: 'never' },
        { title: 'Email', field: 'email', editable: 'onUpdate' },
        {
          title: 'Is admin',
          field: 'user_role',
          editable: 'onUpdate',
          type: 'boolean',
          editComponent: (props) => (
            <Checkbox
              size="medium"
              color="success"
              checked={props.rowData.user_role === 'admin' ? true : false}
              onChange={() => {
                const changeRole =
                  props.rowData.user_role === 'admin' ? 'non-admin' : 'admin'
                props.onChange(changeRole)
              }}
            ></Checkbox>
          ),
          render: (rowData) => (
            <Checkbox
              size="medium"
              color="primary"
              disabled={true}
              checked={rowData.user_role === 'admin' ? true : false}
            ></Checkbox>
          ),
        },
      ]}
      data={data}
      editable={{
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve, reject) => {
            const updated = updateUser({
              variables: {
                username: newData.username,
                newEmail:
                  oldData?.email !== newData.email ? newData.email : undefined,
                newUserRole:
                  oldData?.user_role !== newData.user_role
                    ? newData.user_role
                    : undefined,
              },
            })
            resolve(updated)
          }).then(() => {
            const dataUpdate = [...data]
            const target = dataUpdate.find(
              // @ts-ignore
              (el) => el.id === oldData.tableData.id
            )
            const index = dataUpdate.indexOf(target)
            dataUpdate[index] = newData
            setData([...dataUpdate])
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve, reject) => {
            const deleted = deleteUser({
              variables: {
                username: oldData.username,
              },
            })
            resolve(deleted)
          }).then(() => {
            const dataDelete = [...data]
            const target = dataDelete.find(
              // @ts-ignore
              (el) => el.id === oldData.tableData.id
            )
            const index = dataDelete.indexOf(target)
            dataDelete.splice(index, 1)
            setData([...dataDelete])
          }),
      }}
      options={{
        actionsColumnIndex: -1,
      }}
    />
  )
}

export default UserTable
