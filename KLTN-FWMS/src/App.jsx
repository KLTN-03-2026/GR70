import React from "react";
import { BrowserRouter as Router, Routes, Route ,Navigate} from "react-router-dom";
import { Toaster } from "sonner";


// Layouts
import Layout from "./components/Layout/Layout";
import KitchenLayout from "./components/Layout/KitchenLayout";
import { LayoutAdmin } from "./components/Layout/LayoutAdmin";


// Routes bảo vệ
import PrivateRoute from "./components/PrivateRoute";
import KitchenRoute from "./components/KitchenRoute";
import { AdminRoute } from "./components/AdminRoute";

// Pages - Auth
import Login from "./pages/Login";
import Register from "./pages/Register";

// Manager Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import FoodData from "./pages/FoodData";
import FoodManager from "./pages/foodManager";
import IngredientManager from "./pages/IngredientManager";
import Revenue from "./pages/Revenue";
import WasteHistory from "./pages/WasteHistory";
import Manager_Account_Staff from "./pages/Manager_Account_Staff";
import ManagerProfile from "./pages/ManagerProfile";

// Kitchen Pages
import KitchenDashboard from "./pages/kitchen/KitchenDashboard";
import SurplusDishes from "./pages/kitchen/SurplusDishes/SurplusDishes";
import ProfilePage from "./pages/kitchen/ProfilePage";
import Manager_Dish_Kitchen from "./pages/kitchen/ServedDishes/Manager_Dish_Kitchen";

// Components

import WasteReportPage from "./components/WasteReportPage";

// Admin Pages
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { StoreManager } from "./pages/Admin/StoreManager";
import { UserManager } from "./pages/Admin/UserManager";







function App() {
    const token = localStorage.getItem("token");


    return (
        <>
            <Toaster position="top-right" richColors />

            <Router>
                <Routes>
                    {/* Auth */}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Manager */}
                    <Route
                        path="/app"
                        element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="food-data" element={<FoodData />} />
                        <Route path="foods" element={<FoodManager />} />
                        <Route
                            path="ingredients"
                            element={<IngredientManager />}
                        />
                        <Route
                            path="accounts"
                            element={<Manager_Account_Staff />}
                        />
                        <Route path="revenue" element={<Revenue />} />
                        <Route
                            path="waste-history"
                            element={<WasteHistory />}
                        />
                        <Route
                            path="waste-base"
                            element={<WasteReportPage />}
                        />
                        <Route path="profile" element={<ManagerProfile />} />
                    </Route>

                    {/* Kitchen */}
                    <Route
                        path="/kitchen"
                        element={
                            <KitchenRoute>
                                <KitchenLayout />
                            </KitchenRoute>
                        }
                    >
                        <Route index element={<KitchenDashboard />} />
                        <Route
                            path="surplus-dishes"
                            element={<SurplusDishes />}
                        />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="waste-base" element={<WasteReportPage />} />
                        <Route path="manager-dish" element={<Manager_Dish_Kitchen />} />
                    </Route>

                    {/* Admin */}
                    <Route path="/admin" element={<AdminRoute> <LayoutAdmin /></AdminRoute>} >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="storeManager" element={<StoreManager />} />
                        <Route path="userManager" element={<UserManager />} />

                    </Route>
                </Routes>
            </Router>
        </>
    );
}

export default App;
