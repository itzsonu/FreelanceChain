

# FreelanceChain

FreelanceChain is a web-based accountability platform designed to bring transparency and trust into freelancing workflows. It ensures that projects progress step by step through milestone chains, while tracking freelancer performance in real time.

##  Tech Stack
- **MongoDB** – Database for storing performance history and project data  
- **Express.js** – Backend framework for APIs  
- **React.js** – Frontend interface for dashboards and milestone visualization  
- **Node.js** – Server-side runtime environment  

##  Core Concept
Projects are represented as **linked lists of milestones**.  
- Each milestone (node) must be completed and approved before the next one unlocks.  
- This structure enforces accountability and prevents skipping steps.  

##  Trust Score
- Freelancers are assigned a **real-time Trust Score**.  
- The score updates automatically based on performance history stored in MongoDB.  
- Clients can evaluate reliability before assigning new work.  

##  Features
- **Client Dashboard** – Track project progress and approve milestones  
- **Freelancer Dashboard** – Manage tasks and monitor Trust Score  
- **Visual Milestone Chain** – Intuitive interface showing project flow  

##  Goal
FreelanceChain promotes **transparency, accountability, and trust** in freelancing by combining milestone-based workflows with performance tracking.
