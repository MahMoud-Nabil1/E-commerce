import { Link, useParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="container min-h-screen flex items-center justify-center px-4">
      <div className="max-w-[500px] w-full text-center py-12">
        <div className="text-[4rem] text-green-500 mb-4">✓</div>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-4">Order Placed Successfully!</h1>
        <p className="text-on-surface-variant mb-8">
          Thank you for your purchase. Your order #{orderId} has been received and is being processed.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            to="/profile/orders"
            className="w-full py-3 bg-secondary text-on-secondary font-bold text-base rounded-md no-underline inline-block hover:bg-secondary-container transition-colors active:scale-[0.98]"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="text-secondary no-underline mt-2 font-semibold hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
