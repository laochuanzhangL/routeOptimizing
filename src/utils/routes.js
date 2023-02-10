import { Login, UserHome,AddClientMap,AddClientMap2 } from '../pages/index'
import { NotFound } from '../commponents'
import { Result } from '../pages/result'
import { SelectAddress } from '../pages/selectAddress'
import { Result2 } from '../pages/result2'
import { SelectAddress2 } from '../pages/selectAddress2'
const Routes = [
  {
    path: '/user',
    component: UserHome,
  },
  {
    path: '/selectaddress/:questionId',
    component: SelectAddress,
  },
  {
    path: '/selectaddress2/:questionId',
    component: SelectAddress2,
  },
  {
    path: '/result/:questionId/:finalSolutionId',
    component: Result,
  },
  {
    path: '/result2/:questionId/:finalSolutionId',
    component: Result2,
  },
  {
    path: '/addclientmap',
    component: AddClientMap,
  },
  {
    path: '/addclientmap2',
    component: AddClientMap2,
  },
  {
    path: '/',
    component: Login,
    exact: true,
  },
  {
    path: '/*',
    component: NotFound,
  },
]

export default Routes
