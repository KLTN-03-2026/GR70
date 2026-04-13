import { UserMetrics } from "../../components/UserMetrics";
import { UserControls } from "../../components/UserControls";
import { UserTable } from "../../components/UserTable";

export const UserManager = () => {
    return (
        <div className="max-w-[1440px] mx-auto px-8 py-10 space-y-10">
            <UserMetrics />
            <UserControls />
            <UserTable />
        </div>
    );
};