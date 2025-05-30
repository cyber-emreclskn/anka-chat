# AnkaChat

AnkaChat, Türkiye'nin açık kaynaklı gerçek zamanlı sohbet ve sesli kanal uygulamasıdır.

## Proje Hakkında

AnkaChat, temel Discord özelliklerine sahip açık kaynak bir web tabanlı sohbet platformudur. Türkiye'de erişim problemi olmadan hızlı ve sade bir arayüz ile kullanıcılara yazılı ve sesli iletişim olanağı sunar.

### Özellikler

- 🧑‍💼 **Kullanıcı Yönetimi**: JWT tabanlı güvenli giriş ve kayıt sistemi
- 🏠 **Sunucu Yönetimi**: Kendi sunucunuzu oluşturma ve yönetme
- 🗂️ **Kanal Yönetimi**: Yazılı ve sesli kanallar oluşturma
- 💬 **Mesajlaşma**: WebSocket ile gerçek zamanlı mesajlaşma
- 🔊 **Sesli Görüşme**: WebRTC ile sesli bağlantı
- 👥 **Katılımcılar**: Sesli kanaldaki kullanıcıları görüntüleme
- 🎨 **UI/UX**: Sade ve erişilebilir tasarım (dark mode)

## Teknolojiler

### Backend
- FastAPI
- WebSockets
- SQLite (PostgreSQL'e geçiş yapılabilir)
- JWT Authentication
- SQLAlchemy ORM

### Frontend
- React 
- Redux Toolkit
- Tailwind CSS
- WebSockets
- WebRTC (simple-peer.js)

## Kurulum

### Gereksinimler
- Python 3.8+
- Node.js 14+ ve npm

### Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Sanal ortam oluşturun
python -m venv env

# Sanal ortamı aktifleştirin
# Windows için:
env\Scripts\activate
# Linux/MacOS için:
source env/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Uygulamayı çalıştırın
python main.py
```

### Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Uygulamayı çalıştırın
npm start
```

## Geliştirme

Proje açık kaynaklıdır ve her türlü katkıya açıktır. Pull request'lerinizi bekleriz!

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
