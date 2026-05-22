import { NextResponse } from 'next/server';

// Interface for Slider Image
interface SliderImage {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  link: string;
  order: number;
}

// In-Memory Database initialized with 8 beautiful, high-quality pre-seeded images
let slidersDb: SliderImage[] = [
  {
    id: 'slider-1',
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1600&q=80',
    title: 'মাটির সোঁদা গন্ধে, মমতার স্পর্শে',
    description: 'গ্রামের কৃষকের ঘাম আর কারিগরের মমতা মাখা খাঁটি পণ্য এখন সরাসরি আপনার দোরগোড়ায়।',
    link: '/category/all',
    order: 1,
  },
  {
    id: 'slider-2',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80',
    title: 'ঐতিহ্যবাহী খাঁটি মশলা',
    description: 'বিখ্যাত চট্টগ্রামের মেজবানি রান্নার আসল স্বাদ পেতে আমাদের স্পেশাল গোপন মশলা।',
    link: '/category/spices',
    order: 2,
  },
  {
    id: 'slider-3',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e783137?w=1600&q=80',
    title: 'সুন্দরবনের খাঁটি মধু',
    description: 'রাঙ্গামাটির গভীর জঙ্গল ও সুন্দরবন থেকে সংগৃহীত খাঁটি মধু, শতভাগ কৃত্রিম উপাদানমুক্ত।',
    link: '/category/honey',
    order: 3,
  },
  {
    id: 'slider-4',
    imageUrl: 'https://images.unsplash.com/photo-1626132646529-5003375a954e?w=1600&q=80',
    title: 'উপকূলের তাজা শুঁটকি',
    description: 'প্রাকৃতিকভাবে শুকানো, কোনো রাসায়নিক ছাড়া তৈরি আসল স্বাদের লইট্টা ও ছুরি শুঁটকি।',
    link: '/category/dry-fish',
    order: 4,
  },
  {
    id: 'slider-5',
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=1600&q=80',
    title: 'জৈব ও প্রাকৃতিক চাষাবাদ',
    description: 'আমাদের সকল পণ্য সম্পূর্ণ প্রাকৃতিক উপায়ে উৎপাদিত ও পরম যত্নে সংগৃহীত।',
    link: '/category/organic',
    order: 5,
  },
  {
    id: 'slider-6',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1600&q=80',
    title: 'পাবনার গাওয়া ঘি ও দুগ্ধজাত পণ্য',
    description: 'ঐতিহ্যবাহী পদ্ধতিতে তৈরি খাঁটি ঘি আপনার খাবারে যোগ করবে অতুলনীয় আভিজাত্য।',
    link: '/category/ghee',
    order: 6,
  },
  {
    id: 'slider-7',
    imageUrl: 'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?w=1600&q=80',
    title: 'মানিকগঞ্জের ঘানি-ভাঙা সরিষার তেল',
    description: 'নিজে ঘানি টেনে বের করা খাঁটি তেলের তীব্র ঝাঁঝ ও মনমাতানো সুবাস।',
    link: '/category/spices',
    order: 7,
  },
  {
    id: 'slider-8',
    imageUrl: 'https://images.unsplash.com/photo-1608697138356-dfc0032cc629?w=1600&q=80',
    title: 'বাংলার কারিগরদের ঐতিহ্যবাহী মৃৎশিল্প',
    description: 'মমতা ও ঐতিহ্যের ছোঁয়ায় তৈরি খাঁটি দেশীয় মাটির বাসন-কোসন ও সাজসজ্জা।',
    link: '/category/crafts',
    order: 8,
  }
];

// Re-sort helpers
const sortSliders = (list: SliderImage[]) => {
  return [...list].sort((a, b) => a.order - b.order);
};

// GET Route: Fetch slider list
export async function GET() {
  try {
    return NextResponse.json({ success: true, sliders: sortSliders(slidersDb) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST Route: Add slider OR Reorder sliders
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Reorder Action if sliders list is sent
    if (body.reorderList && Array.isArray(body.reorderList)) {
      const items = body.reorderList as { id: string; order: number }[];
      
      slidersDb = slidersDb.map(slide => {
        const matchingItem = items.find(it => it.id === slide.id);
        if (matchingItem) {
          return { ...slide, order: matchingItem.order };
        }
        return slide;
      });

      return NextResponse.json({
        success: true,
        message: 'Sliders reordered successfully',
        sliders: sortSliders(slidersDb)
      });
    }

    // Add Slide Action
    const { imageUrl, title, description, link } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'ImageUrl is required' }, { status: 400 });
    }

    const newSlide: SliderImage = {
      id: `slider-${Date.now()}`,
      imageUrl,
      title: title || '',
      description: description || '',
      link: link || '#',
      order: slidersDb.length > 0 ? Math.max(...slidersDb.map(s => s.order)) + 1 : 1
    };

    slidersDb.push(newSlide);

    return NextResponse.json({
      success: true,
      message: 'Slider added successfully',
      slider: newSlide,
      sliders: sortSliders(slidersDb)
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE Route: Remove a slider image by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Slider ID is required' }, { status: 400 });
    }

    const index = slidersDb.findIndex(s => s.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Slider image not found' }, { status: 404 });
    }

    slidersDb = slidersDb.filter(s => s.id !== id);

    // Normalize order numbering
    slidersDb = sortSliders(slidersDb).map((s, idx) => ({ ...s, order: idx + 1 }));

    return NextResponse.json({
      success: true,
      message: 'Slider deleted successfully',
      sliders: sortSliders(slidersDb)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
