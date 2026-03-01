import { Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        zIndex: 10,
        height: 56,
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        component={Link}
        to="/"
        variant="body1"
        sx={{
          textDecoration: 'none',
          color: 'text.primary',
          fontWeight: 700,
          fontSize: '1.3rem',
        }}
      >
        MasterPuzzle
      </Typography>
    </Box>
  )
}
