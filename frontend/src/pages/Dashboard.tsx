import Layout from "../components/layout/Layout";
import Wishlist from "../components/Wishlist";

const Dashboard = () => {
  return (
    <Layout>
      <div className="mt-6">
        <h2 className="text-2xl sm:text-3xl font-semibold pb-6 text-center">
          Your Wishlists
        </h2>
        <Wishlist />
      </div>
    </Layout>
  );
};

export default Dashboard;
