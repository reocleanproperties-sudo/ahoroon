import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  { id: 'shukti', name: 'শুটকি মাছ', icon: 'Fish' },
  { id: 'sea-fish', name: 'সামুদ্রিক মাছ', icon: 'Waves' },
  { id: 'hilly', name: 'পাহাড়ি পণ্য', icon: 'Mountain' },
  { id: 'spices', name: 'খাঁটি মশলা', icon: 'Flame' },
  { id: 'tradition', name: 'ঐতিহ্যবাহী', icon: 'Utensils' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'চট্টগ্রামের লইট্টা শুটকি',
    price: 450,
    rating: 4.9,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1626132646529-5003375a954e?w=800&q=80',
    category: 'shukti',
    description: 'প্রাকৃতিকভাবে শুকানো, কোন রাসায়নিক ছাড়া তৈরি—আসল স্বাদের লইট্টা শুটকি। সরাসরি চট্টগ্রামের উপকূল থেকে সংগৃহীত।',
    isFlashSale: true,
    discount: 10,
    images: ['https://images.unsplash.com/photo-1626132646529-5003375a954e?w=800&q=80']
  },
  {
    id: '2',
    name: 'মেজবানি মাংসের মশলা',
    price: 280,
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    category: 'spices',
    description: 'বিখ্যাত চট্টগ্রামের মেজবানি রান্নার আসল স্বাদ পেতে আমাদের স্পেশাল গোপন মশলা। ১০০% প্রাকৃতিক উপাদান।',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80']
  },
  {
    id: '3',
    name: 'খাঁটি পাহাড়ি মধু',
    price: 850,
    rating: 5.0,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e783137?w=800&q=80',
    category: 'hilly',
    description: 'রাঙ্গামাটির গভীর জঙ্গল থেকে সংগৃহীত খাঁটি মধু। স্বাদে ও গুণে অনন্য, ভেজালমুক্ত নিশ্চয়তা।',
    isFlashSale: true,
    discount: 5,
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e783137?w=800&q=80']
  },
  {
    id: '4',
    name: 'ঐতিহ্যবাহী মধু ভাত',
    price: 320,
    rating: 4.7,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1512058560366-cd242d45869d?w=800&q=80',
    category: 'tradition',
    description: 'চট্টগ্রামের ঐতিহ্যবাহী খাবার "মধু ভাত"। স্বাদে ও পুষ্টিতে অনন্য একটি রাজকীয় খাবার।',
    images: ['https://images.unsplash.com/photo-1512058560366-cd242d45869d?w=800&q=80']
  },
  {
    id: '5',
    name: 'রাপচাদা মাছ (তাজা)',
    price: 950,
    rating: 4.9,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1534948665785-5ec717551bb5?w=800&q=80',
    category: 'sea-fish',
    description: 'তাজা ও পুষ্টিকর সামুদ্রিক রূপচাদা মাছ, সরাসরি উপকূলীয় অঞ্চল থেকে সংগ্রহ করা।',
    images: ['https://images.unsplash.com/photo-1534948665785-5ec717551bb5?w=800&q=80']
  }
];
