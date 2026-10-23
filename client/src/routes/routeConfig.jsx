import { BadgeDollarSign, CreditCardCheck, IdCardLanyard, LayoutDashboard, Package, PlusCircleIcon, Summary, Truck } from "lucide-react";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products/Products";
import Employees from "../pages/Employees/Employees";
import Reports from "../pages/Reports";
import Transactions from "../pages/Transaction/Transactions";
import Suppliers from "../pages/Suppliers/Suppliers";
import Billings from "../pages/Billing/Billings";

export const routeConfig = [
  {
    name: "Login",
    path: "/",
    component:Login,
    permission: [],
    isMenu:false
  },
  {
    name:"Dashboard",
    path:"/dashboard",
    component:Dashboard,
    icon:LayoutDashboard,
    permission:["ADMIN","STAFF"],
    isMenu:true
  },
   {
    name:" Products",
    path:"/products",
    component:Products,
    icon:Package,
    permission:["ADMIN","STAFF"],
    isMenu:true
  },
   {
    name:" Employees  ",
    path:"/employee",
    component:Employees,
    icon:IdCardLanyard,
    permission:["ADMIN"],
    isMenu:true
  },
  {
    name:" Billings  ",
    path:"/billings",
    component:Billings,
    icon:BadgeDollarSign,
    permission:["ADMIN","STAFF"],
    isMenu:true
  },
  // {
  //   name:" Reports  ",
  //   path:"/reports",
  //   component:Reports,
  //   icon:Summary,
  //   permission:["ADMIN","STAFF"],
  //   isMenu:true
  // },
  {
    name:" Transactions  ",
    path:"/transactions",
    component:Transactions,
    icon:CreditCardCheck,
    permission:["ADMIN"],
    isMenu:true
  },
  {
    name:" Suppliers  ",
    path:"/suppliers",
    component:Suppliers,
    icon:Truck,
    permission:["ADMIN","STAFF"],
    isMenu:true
  }
];
