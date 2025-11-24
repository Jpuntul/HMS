# 🏥 Healthcare Management System (HMS)

A comprehensive healthcare management platform with **hybrid authentication** - allowing public browsing while requiring authentication for data modifications.

## ✨ Key Features

- **🔐 Hybrid Authentication**: Browse freely, authenticate for CRUD operations
- **📊 Healthcare Management**: Patients, staff, facilities with analytics
- **🎨 Modern UI**: React + TypeScript with responsive design
- **🚀 Production Ready**: Django REST API with MySQL database

## 🛠️ Technology Stack

**Backend:** Django 4.2.25 • Django REST Framework • MySQL • JWT Auth
**Frontend:** React 19.1.1 • TypeScript • Vite • Tailwind CSS

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Jpuntul/HMS.git
cd HMS

# Setup backend
cd back
cp .env.example .env  # Configure environment variables
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Setup frontend (new terminal)
cd ../front
cp .env.example .env  # Configure environment variables
npm install && npm run dev
```

**Access:** Frontend at `http://localhost:5173` • Backend at `http://localhost:8000`

> **Note:** Both frontend and backend now use `.env` files for configuration. Update `VITE_API_BASE_URL` and `PORT` as needed.

## 📚 Documentation

- **[📖 Complete Setup Guide](docs/SETUP_GUIDE.md)** - Detailed installation instructions
- **[� Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Environment configuration guide
- **[�🔌 API Documentation](docs/API_DOCUMENTATION.md)** - Full API reference
- **[🤝 Contributing Guide](docs/CONTRIBUTING.md)** - Development guidelines
- **[🗃️ Database Schema](docs/DATABASE_SCHEMA.md)** - Database structure

## 🎯 How It Works

### 🔍 Public Access (No Login Required)

- Browse 447+ patient records
- View 303+ healthcare staff members
- Explore 11+ medical facilities
- Access analytics dashboard

### ✏️ Authenticated Actions (Login Required)

- Add new patients, staff, or facilities
- Edit existing records
- Delete outdated information
- Full CRUD operations

**Smart UI:** Buttons dynamically show "Login to Add/Edit" when authentication is needed.

## 📊 Sample Data

The system comes with realistic healthcare data:

- **Patients**: Canadian Medicare numbers, demographics, medical history
- **Staff**: Doctors, nurses, administrators with roles and departments
- **Facilities**: Hospitals, clinics, pharmacies with capacity management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jpuntul**

- GitHub: [@Jpuntul](https://github.com/Jpuntul)

## 🙏 Acknowledgments

- Django REST Framework team for excellent API tools
- React team for the powerful frontend library
- Tailwind CSS for beautiful, responsive styling
- Healthcare professionals who inspired this project

---

**🚀 Ready to manage healthcare data efficiently!**

_For questions or support, please open an issue on GitHub._
