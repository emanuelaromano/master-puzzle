import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './views/Layout'
import NotFound from './views/NotFound'
import Puzzle from './views/Puzzle'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Puzzle /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
