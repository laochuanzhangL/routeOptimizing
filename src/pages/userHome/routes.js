import { Home, Percenter, Msgcenter, ClientManage} from './page/index'
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
    path: '/clientManage',
    component: ClientManage,
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
