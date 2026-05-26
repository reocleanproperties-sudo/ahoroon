import { Category, Product, SliderImage } from './types';

import { Category, Product, SliderImage } from './types';

export const STATIC_SLIDERS: SliderImage[] = [];

export const CATEGORIES: Category[] = [
  { id: 'নিরাপদ-প্রাকৃতিক-সার', name: 'নিরাপদ প্রাকৃতিক সার', icon: 'Leaf' },
  { id: 'নিরাপদ-আবাদের-চাল', name: 'নিরাপদ আবাদের চাল', icon: 'Wheat' },
  { id: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', name: 'নিরাপদ আবাদের দেশি ডাল ও বিচি', icon: 'Beans' },
  { id: 'নিরাপদ-আবাদের-দেশি-মশলা', name: 'নিরাপদ আবাদের দেশি মশলা', icon: 'Flame' },
  { id: 'নিরাপদ-ভোজ্য-তেল', name: 'নিরাপদ ভোজ্য তেল', icon: 'Droplets' },
  { id: 'নিরাপদ-আবাদের-পাহাড়ি-ফল-এবং-সবজী', name: 'নিরাপদ আবাদের পাহাড়ি ফল এবং সবজী', icon: 'Apple' },
  { id: 'ময়দা-ও-ছাতু-আইটেম', name: 'ময়দা ও ছাতু আইটেম', icon: 'Wheat' },
  { id: 'দুগ্ধজাত-পন্য', name: 'দুগ্ধজাত পন্য', icon: 'Milk' },
  { id: 'প্রাকৃতিক-মিষ্টি', name: 'প্রাকৃতিক মিষ্টি', icon: 'Candy' },
  { id: 'প্রাকৃতিক-নির্যাস', name: 'প্রাকৃতিক নির্যাস', icon: 'Droplet' },
  { id: 'আদরের-শিশুদের-খাদ্য', name: 'আদরের শিশুদের খাদ্য', icon: 'Baby' },
  { id: 'প্রাকৃতিক-গুল্মলতার-পুনর্জীবনদায়ী-প্রাচীন-প্রতিকার', name: 'প্রাকৃতিক গুল্মলতার পুনর্জীবনদায়ী প্রাচীন প্রতিকার', icon: 'Leaf' },
  { id: 'নিরাপদ-ড্রাই-ফিশ', name: 'নিরাপদ ড্রাই ফিশ', icon: 'Fish' },
  { id: 'নিরাপদ-তরতাজা-আমিষ', name: 'নিরাপদ তরতাজা আমিষ', icon: 'Drumstick' },
  { id: 'অন্যান্য', name: 'অন্যান্য', icon: 'MoreHorizontal' },
];

export const PRODUCTS: Product[] = [
  // নিরাপদ প্রাকৃতিক সার
  { id: 's01', name: 'সরিষার খইল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-প্রাকৃতিক-সার', description: '', images: [] },
  { id: 's02', name: 'পাতাপচা স্যার', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-প্রাকৃতিক-সার', description: '', images: [] },
  { id: 's03', name: 'গাছের প্রাকৃতিক প্রোটিন', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-প্রাকৃতিক-সার', description: '', images: [] },

  // নিরাপদ আবাদের চাল
  { id: 'c01', name: 'পাহাড়ি জুমের লাল বিন্নি চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c02', name: 'পাহাড়ি জুমের সাদা বিন্নি চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c03', name: 'পাহাড়ি জুমের কালো বিন্নি চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c04', name: 'পাহাড়ি জুমের অঙ্কুর করা জালার চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c05', name: 'পাহাড়ি জুমের কাউন চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c06', name: 'নিরাপদ আবাদের আদি হিজলদীঘা চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c07', name: 'নিরাপদ আবাদের আদি টেপাবোরো চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c08', name: 'নিরাপদ আবাদের আদি চামারা চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c09', name: 'নিরাপদ আবাদের আদি বিরই চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c10', name: 'নিরাপদ ফুল ফাইবার লাল চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c11', name: 'ফুল ফাইবার কালো চাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },
  { id: 'c12', name: 'শতভাগ আসল আদি কালিজিরা চাল (পোলাও চাল)', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-চাল', description: '', images: [] },

  // নিরাপদ আবাদের দেশি ডাল ও বিচি
  { id: 'd01', name: 'দেশি মশুর ডাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd02', name: 'দেশি মুগ ডাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd03', name: 'পাহাড়ি জুমের সোনামুখি সবুজ মুগ কালাই ডাল (খোসা সহ)', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd04', name: 'পাহাড়ি জুমের সোনামুখি সবুজ মুগ কালাই ডাল (খোসা ছাড়া)', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd05', name: 'পাহাড়ি খোসা সহ মাষকলাই ডাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd06', name: 'পাহাড়ি খোসা ছাড়া মাষকলাই ডাল', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd07', name: 'পাহাড়ি খোসা সহ পেলম বিচি', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd08', name: 'পাহাড়ি খোসা ছাড়া পেলম বিচি', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd09', name: 'পাহাড়ি লাল গিরা সিমের বিচি', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd10', name: 'পাহাড়ি কালো সিমের বিচি', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd11', name: 'পাহাড়ি জুমের রাজমা বিচি', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd12', name: 'পাহাড়ি কাজু বাদাম', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd13', name: 'পাহাড়ি চিনা বাদাম', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd14', name: 'পাহাড়ি মিষ্টি কুমড়ার বীজ', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd15', name: 'সূর্যমুখী ফুলের বীজ', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd16', name: 'দেশি তোকমা', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },
  { id: 'd17', name: 'কুমড়ো বড়ি', price: 0, rating: 0, reviews: 0, image: '', category: 'নিরাপদ-আবাদের-দেশি-ডাল-ও-বিচি', description: '', images: [] },

  // অন্যান্য items and so on...
];
