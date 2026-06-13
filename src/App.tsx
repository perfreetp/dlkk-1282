import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { Product } from './pages/Product';
import { Service } from './pages/Service';
import { Sms } from './pages/Sms';
import { ImagePage } from './pages/Image';
import { HistoryPage } from './pages/History';
import { Account } from './pages/Account';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<Product />} />
          <Route path="service" element={<Service />} />
          <Route path="sms" element={<Sms />} />
          <Route path="image" element={<ImagePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="account" element={<Account />} />
          <Route path="account/brand" element={<Account />} />
          <Route path="account/templates" element={<Account />} />
          <Route path="account/stats" element={<Account />} />
          <Route path="account/team" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
