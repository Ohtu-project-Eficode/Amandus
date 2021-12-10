import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_USERS } from '../graphql/queries'
import Container from '@material-ui/core/Container'
import UserTable from './UserTable'
import { UserType } from '../types'

interface Props {
  user: UserType | undefined
}

const UserManagement = ({ user }: Props) => {
  const { data, loading, error } = useQuery(ALL_USERS)

  if (user?.user_role !== 'admin') {
    return (
      <h1>
        Not Authorized
      </h1>
    )
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error occurred while fetching users</p>
  }

  return (
    <Container>
      <UserTable users={data.getAllUsers} />
    </Container>
  )
}

export default UserManagement
