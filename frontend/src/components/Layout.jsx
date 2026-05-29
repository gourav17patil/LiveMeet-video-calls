import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

const Layout = ({ children, showSidebar = false }) => {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  return (
    <div className=" min-h-screen bg-base-200">
      <div className="flex">
        {showSidebar && (
          <Sidebar
            isMessagesOpen={isMessagesOpen}
            setIsMessagesOpen={setIsMessagesOpen}
          />
        )}

        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
