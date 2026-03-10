# LUXE FASHION - Premium E-Commerce Website Specification

## Project Overview
- **Project Name**: Luxe Fashion
- **Type**: Full-stack E-commerce Website
- **Core Functionality**: Premium clothing e-commerce with product catalog, shopping cart, checkout (Stripe + WhatsApp), digital receipts, and admin dashboard
- **Target Users**: High-end fashion consumers and store administrators

## Tech Stack
- **Frontend**: Next.js 14 (React)
- **Styling**: TailwindCSS with custom color palette
- **Backend**: Firebase (Firestore + Authentication)
- **Animations**: Framer Motion
- **Payment**: Stripe API
- **Communication**: WhatsApp API

## Color Palette
- **Primary Background**: #FFFFFF (White)
- **Accent Color**: #93C572 (Light Pistachio Green)
- **Secondary**: #1A1A1A (Dark text)
- **Muted**: #6B7280 (Gray)
- **Success**: #10B981
- **Error**: #EF4444

## UI/UX Specification

### Layout Structure
- **Header**: Fixed navigation with logo, nav links, cart icon with badge
- **Hero**: Full-width hero section with featured collection
- **Product Grid**: Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- **Footer**: Minimal footer with contact info and social links

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Components

#### Product Card
- High-quality image with hover zoom effect
- Product title and price
- Color swatches (clickable circles)
- Size selector (S, M, L, XL buttons)
- Add to Cart button with animation
- Smooth hover transitions (0.3s ease)

#### Shopping Cart (Slide-out)
- Right-side drawer animation
- Product list with quantity controls
- Real-time total calculation
- Checkout and WhatsApp buttons
- Close button and backdrop

#### Checkout Form
- Full Name input
- Full Address textarea
- Phone Number input
- Stripe payment section
- WhatsApp order button
- Form validation

#### Digital Receipt
- Order summary
- Customer details
- Items purchased
- Total amount
- Print button

#### Admin Dashboard
- Stats cards (Total Orders, Revenue)
- Product management form
- Order table with status
- Real-time updates from Firestore

## Functionality Specification

### Customer Features
1. Browse products with filtering
2. Select product colors and sizes
3. Add items to cart
4. Adjust quantities in cart
5. Checkout with Stripe payment
6. Order via WhatsApp
7. View digital receipt

### Admin Features
1. View analytics dashboard
2. Add new products
3. Edit existing products
4. Delete products
5. View all orders
6. Update order status

## Firebase Structure

### Collections
- `products`: id, title, price, image, colors[], sizes[], createdAt
- `orders`: id, customerName, address, phone, items[], total, status, paymentMethod, createdAt

## Acceptance Criteria
- [ ] Products display correctly with images, prices, colors, sizes
- [ ] Cart updates in real-time
- [ ] Checkout form validates all fields
- [ ] Stripe payment processes correctly
- [ ] WhatsApp message formats correctly
- [ ] Receipt displays after checkout
- [ ] Admin can add/edit/delete products
- [ ] Admin can view and update orders
- [ ] Responsive on all devices
- [ ] Smooth animations throughout

