# Real-time inventory system
## Deployed on Vercel
https://inventorypro1.vercel.app

## PROJECT BY
CODE BUSTERS:
- Shrinesh TM
- Sujithra G
- Varun krishna C
- Sumanth devarathi rajinikath

We bilt this project together for a hacathon which made us understand more about typescript and a fullstack experience 

##  Features

###  InventoryPro

-  Complete Inventory Management System  
-  Real-time Notifications  
-  Dark Theme Support  
-  PDF Report Generation  
-  Multi-user Authentication (Admin/Staff)  
-  Stock Level Monitoring & Alerts  
-  Activity Logging & Reporting  
-  Indian Rupee (`₹`) Support  
-  Responsive Design  


##  Tech Stack

###  Frontend
- **Next.js** (React Framework)
- **TailwindCSS** (Styling)
- **TypeScript** (Type Safety)
- **Chart.js** (Reporting Charts)

###  Backend
- **PostgreSQL** (Relational Database)
- **Prisma ORM** (Database Client)
- **pgAdmin** (GUI for PostgreSQL)
- **Next.js App Router API** (for REST endpoints)

###  Dev Tools
- **VS Code**
- **Prisma Studio** (optional)
- **Node.js** (Runtime)
- **npm** (Package Manager)

  
###  Shipments

- Product selection with stock validation  
- Auto-calculated shipping fees  
- Real-time stats: quantity, value, shipping revenue  
- Search & filter by product or category  
- Timestamps for last shipment updates  

---

###  Reports

- Toggle between inventory and shipment data  
- Shipment analytics: turnover, top products, charts  
- Revenue tracking (product + shipping fees)  

---

###  Activity Logs

- Separate logs for inventory & shipments  
- Track actions with user, time, quantity, and notes  
- PDF export for combined logs  
- Advanced filters by user, product, or action  

---

###  Smart Integration

- Auto stock deduction on shipment  
- Alerts update when stock is affected  
- Unified, consistent UI with role-based access  

---

###  Key Functional Logic

- `"Only X units are available"` stock validation  
- `Shipping Fee = (Price × %) / 100`  
- `Total Value = (Price + Fee) × Quantity`  
- Full logging for every change made  
