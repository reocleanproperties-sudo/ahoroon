import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle2, ChevronLeft, MapPin, Phone, MessageSquare } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Package },
  { id: 'processing', label: 'Processing', icon: CheckCircle2 },
  { id: 'shipped', label: 'On the Way', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulated live location
  const [deliveryCoord, setDeliveryCoord] = useState({ lat: 23.8103, lng: 90.4125 }); // Dhaka

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();

    // Simulating moving courier
    const interval = setInterval(() => {
      setDeliveryCoord(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (!order) return <div className="p-8 text-center uppercase font-bold text-gray-400">Order not found</div>;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-bold">
            <ChevronLeft size={16} />
            Back to Home
          </Link>
          {auth.currentUser && (
            <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-bold">
              View Profile / Orders
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-6 overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tracking ID</p>
                  <h1 className="text-xl font-bold font-display text-gray-900">#{orderId?.slice(-8).toUpperCase()}</h1>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {order.status}
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative pt-8 pb-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-1000 ease-out" 
                  style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-3">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: isActive ? 1.2 : 1,
                            backgroundColor: isCompleted ? 'var(--color-primary)' : '#fff'
                          }}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors border-2 ${isCompleted ? 'border-primary' : 'border-gray-100'}`}
                        >
                          <Icon size={20} className={isCompleted ? 'text-white' : 'text-gray-300'} />
                        </motion.div>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Map View */}
            <div className="glass-card aspect-video lg:aspect-auto lg:h-[400px] overflow-hidden relative">
              {hasValidKey ? (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={deliveryCoord}
                    defaultZoom={15}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                  >
                    <AdvancedMarker position={deliveryCoord}>
                      <Pin background="#10B981" glyphText="🚚" glyphColor="#fff" borderColor="#065F46" />
                    </AdvancedMarker>
                    <AdvancedMarker position={{ lat: 23.7947, lng: 90.4011 }}>
                      <Pin background="#0F172A" glyphText="🏠" glyphColor="#fff" />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-8 text-center space-y-3">
                   <MapPin size={48} className="text-gray-300 animate-bounce" />
                   <h3 className="font-bold text-gray-500">Real-time Map tracking is active</h3>
                   <p className="text-xs text-gray-400 max-w-xs">Your order is currently near Gulshan, Dhaka. Our courier will contact you soon.</p>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=courier" alt="Courier" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Mofiz Uddin</h4>
                    <p className="text-[10px] font-bold text-primary uppercase">Your Delivery Partner</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-gray-50 rounded-xl text-gray-600 hover:text-primary transition-colors tap-feedback">
                    <MessageSquare size={18} />
                  </button>
                  <button className="p-3 bg-primary rounded-xl text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all tap-feedback">
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Order Details</h3>
              <div className="space-y-3">
                {order.items?.map((item: any, idx: number) => {
                  const qty = item.cartQuantity || item.quantity || 1;
                  return (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 font-sans">
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">Qty: {qty} {item.unit || 'pcs'}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">৳{item.price * qty}</p>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm font-bold text-gray-500 uppercase">Total Amount</p>
                <p className="text-xl font-bold text-primary">৳{order.total || order.items?.reduce((acc: number, it: any) => acc + (it.price * (it.cartQuantity || it.quantity || 1)), 0) || 0}</p>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Shipping To</h3>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900">{order.customer?.name}</p>
                <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                <p className="text-xs text-gray-500 italic leading-relaxed">{order.customer?.address}</p>
              </div>
            </div>

            <button className="w-full button-primary flex items-center justify-center gap-2 group">
              <Package size={18} className="transition-transform group-hover:scale-110" />
              Need Help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
