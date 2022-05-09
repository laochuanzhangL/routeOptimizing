import { Home, Percenter, Msgcenter, Tddisplay } from './page/index'
import { NotFound } from '../../commponents'
const Routes = [
  {
    path: '/percenter',
    component: Percenter,
  },
  {
    path: '/msgcenter',
    component: Msgcenter,
  },
  {
    path: '/tddisplay',
    component: Tddisplay,
  },
  {
    path: '/',
    component: Home,
  },
  {
    path: '/*',
    component: NotFound,
  },
]

export default Routes
