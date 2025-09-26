import Layout from "../components/layout/Layout";
import Wishlist from "../components/Wishlist";

const Dashboard = () => {
  return (
    <Layout>
      <div className="mt-6">
        <Wishlist />
      </div>
    </Layout>
  );
};

export default Dashboard;
