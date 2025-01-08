import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaleComponent } from './domain/sale/sale.component';
import { ClientComponent } from './domain/client/client.component';
import { ProductComponent } from './domain/product/product.component';
import { UserComponent } from './domain/user/user.component';
import { DashboardComponent } from './domain/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { HistoryComponent } from './domain/history/history.component';
import { ReportComponent } from './domain/report/report.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'user',
        component: UserComponent
      },
      {
        path: 'product',
        component: ProductComponent
      },
      {
        path: 'sale',
        component: SaleComponent
      },
      {
        path: 'client',
        component: ClientComponent
      },
      {
        path: 'history',
        component: HistoryComponent
      },
      {
        path: 'report',
        component: ReportComponent
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
