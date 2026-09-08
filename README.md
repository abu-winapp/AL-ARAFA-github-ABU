# Al Arafa - Web Application

A modern, SEO-optimized web application for Al Arafa food delivery platform built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 (with custom theme)
- **State Management**: Zustand 5
- **Forms**: React Hook Form + Yup validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 🎨 Design System

The web app follows the same design system as the mobile app:

### Brand Colors
- **Primary**: `#9f0008` (Al Arafa red)
- **Secondary**: `#FFC016` (Gold accent)
- **Background**: `#FFFFFF`, `#F5F7FA`
- **Text**: `#242424`, `#4a5568`, `#718096`

### Status Colors
- Pending: Orange (`#ed8936`)
- Confirmed: Blue (`#4299e1`)
- Preparing: Purple (`#805ad5`)
- Ready: Teal (`#38b2ac`)
- Delivered: Green (`#48bb78`)
- Cancelled: Red (`#f56565`)

## 📁 Project Structure

```
salem-rr-briyani-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles with theme
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── menu/             # Menu-related components
│   │   ├── cart/             # Cart components
│   │   ├── checkout/         # Checkout components
│   │   ├── order/            # Order tracking components
│   │   └── profile/          # User profile components
│   ├── lib/                   # Utilities and libraries
│   │   ├── api/              # API services
│   │   │   └── client.ts     # Axios client with auth interceptors
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── store/            # Zustand stores
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts          # All API types from backend
│   ├── config/                # Configuration files
│   │   └── theme.ts          # Theme configuration
│   └── styles/                # Additional styles
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd salem-rr-briyani-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# HitPay Payment Gateway (from backend)
NEXT_PUBLIC_HITPAY_API_KEY=your_hitpay_key_here

# Google Maps (for address autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📡 Backend API Integration

The web app connects to the Al Arafa Spring Boot backend running on port 8080.

### Key API Endpoints

#### Authentication
- `POST /api/customer/auth/request-otp` - Request OTP
- `POST /api/customer/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

#### Menu
- `GET /api/menu/categories` - Get menu categories
- `GET /api/menu/items` - Get menu items
- `GET /api/menu/items/{id}` - Get item details
- `GET /api/menu/search` - Search menu

#### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove from cart

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user orders
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/track/{orderNumber}` - Track order

#### Payment
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/webhook/hitpay` - HitPay webhook

### Authentication Flow

1. User enters phone number
2. Backend sends OTP via Twilio
3. User enters OTP
4. Backend verifies and returns JWT tokens
5. Access token stored in localStorage
6. Refresh token used to get new access token

The API client (`src/lib/api/client.ts`) automatically:
- Adds Bearer token to requests
- Refreshes expired tokens
- Redirects to login on auth failure

## 🎯 Key Features to Implement

### Phase 1: Core Ordering Flow
- [ ] Login screen (SMS/OTP)
- [ ] Menu browsing with categories
- [ ] Item details and customization
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Payment integration (HitPay)
- [ ] Order tracking

### Phase 2: User Profile
- [ ] Profile management
- [ ] Address management
- [ ] Order history
- [ ] Payment methods
- [ ] Notifications settings

### Phase 3: Advanced Features
- [ ] Loyalty points
- [ ] Promo codes
- [ ] FAQs
- [ ] Feedback system
- [ ] Real-time order updates (WebSocket)

## 🎨 Component Guidelines

### Naming Conventions
- Components: PascalCase (`MenuCard.tsx`)
- Hooks: camelCase with 'use' prefix (`useCart.ts`)
- Utils: camelCase (`formatPrice.ts`)
- Types: PascalCase (`MenuItem`, `Order`)

### Component Structure
```tsx
// Example component structure
import { FC } from 'react';
import type { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard: FC<MenuCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Component content */}
    </div>
  );
};
```

### Styling with Tailwind
Use Tailwind utility classes with the custom theme:
```tsx
<button className="bg-primary text-white hover:bg-primary-dark rounded-lg px-6 py-3">
  Order Now
</button>
```

## 🔐 Security Considerations

- JWT tokens stored in localStorage (not cookies for web app)
- API client handles token refresh automatically
- All API requests include CSRF protection (if enabled in backend)
- Input validation using Yup schemas
- XSS protection via React's built-in escaping

## 📱 Responsive Design

The app is mobile-first and responsive:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Use Tailwind responsive utilities:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel (Recommended)
1. Push to GitLab
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to VPS
1. Build the app: `npm run build`
2. Copy `.next`, `public`, `package.json` to server
3. Run `npm install --production`
4. Start with PM2: `pm2 start npm --name "salem-web" -- start`

## 📊 SEO Optimization

Next.js App Router provides excellent SEO:
- Server-side rendering for menu pages
- Dynamic meta tags for sharing
- Sitemap generation
- robots.txt configuration

Example metadata:
```tsx
export const metadata = {
  title: 'Al Arafa - Authentic South Indian Cuisine',
  description: 'Order delicious biryani and South Indian dishes online',
  openGraph: {
    title: 'Al Arafa',
    description: 'Authentic South Indian Cuisine Delivery',
    images: ['/og-image.jpg'],
  },
};
```

## 🧪 Testing (To Be Added)

Future testing setup:
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **API Tests**: MSW (Mock Service Worker)

## 📄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit merge request to GitLab

## 📞 Support

For issues or questions:
- Backend API: Check `salemrrbriyani-backend` repository
- Mobile App: Check `salem-rr-briyani-mobile` repository

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Backend API Documentation](http://localhost:8080/swagger-ui.html)

## 🎯 Next Steps

1. **Set up API services** - Create service files for each module (auth, menu, cart, etc.)
2. **Build Zustand stores** - State management for cart, user, orders
3. **Create UI components** - Button, Card, Input, Modal, etc.
4. **Implement pages** - Home, Menu, Cart, Checkout, Profile
5. **Add HitPay integration** - Payment gateway
6. **Implement WebSocket** - Real-time order updates
7. **Add analytics** - Google Analytics or similar
8. **Performance optimization** - Image optimization, code splitting
9. **Testing** - Unit and E2E tests
10. **Deployment** - Deploy to Vercel or VPS

---

Built with ❤️ for Al Arafa
