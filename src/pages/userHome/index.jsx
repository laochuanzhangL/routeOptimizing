import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './styles.scss'
import { Header, Footer } from './commponents'
import Routes from './routes'
export function UserHome() {
  return (
    <div className="userHome">
      <Header />
      <div className="home_content">
        <Switch>
          {Routes.map((item) => (
            <Route path={`/user${item.path}`} component={item.component} />
          ))}
        </Switch>
      </div>
      <Footer />
    </div>
  )
}
