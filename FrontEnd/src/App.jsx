import { Route, Routes } from "react-router-dom";
import SkeletonLayout from "./Components/SkeletonLayout.jsx";
import SkeletonPage from "./Components/SkeletonPage.jsx";
import "./App.css";

const pages = [
  ["/", "Dashboard"], ["/profile", "Profile"], ["/wallets", "Wallets"],
  ["/withdraw", "Withdraw"], ["/buy-sell", "Buy & Sell"],
  ["/VerifyIdentityPage", "Identity verification"], ["/sign-in", "Sign in"],
  ["/sign-up", "Sign up"], ["/reset-password", "Reset password"],
  ["/forgot-password", "Forgot password"], ["/BitcoinChart", "Bitcoin market"],
  ["/BNBChart", "BNB market"], ["/real-currencies/btcusdt", "BTC / USDT"],
  ["/real-currencies/bchusdt", "BCH / USDT"], ["/Admin/*", "Administration"],
  ["/news", "News"], ["/news/:id", "News article"], ["/education", "Education"],
  ["/education/how-to-secure-your-wallet", "Wallet security"],
  ["/education/what-is-blockchain", "Blockchain basics"], ["/faq", "FAQ"],
  ["/support", "Support"], ["/feedback", "Feedback"],
  ["/rug-pull", "Rug-pull awareness"], ["/service-offline", "Service unavailable"],
  ["/session-expired", "Session expired"],
];

export default function App() {
  return (
    <SkeletonLayout>
      <Routes>
        {pages.map(([path, title]) => (
          <Route key={path} path={path} element={<SkeletonPage title={title} />} />
        ))}
        <Route path="*" element={<SkeletonPage title="Page not found" />} />
      </Routes>
    </SkeletonLayout>
  );
}
