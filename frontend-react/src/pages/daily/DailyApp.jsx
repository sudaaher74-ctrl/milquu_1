import { Outlet } from 'react-router-dom';
import { DailyProvider, useDaily } from './DailyContext';
import { Toast } from './ui';
import './daily.css';

/** The toast lives outside the routed screen so it survives navigation. */
function Shell() {
  const { toast } = useDaily();
  return (
    <div className="mq-shell">
      <Outlet />
      <Toast message={toast} />
    </div>
  );
}

export default function DailyApp() {
  return (
    <div className="mq-app">
      <DailyProvider>
        <Shell />
      </DailyProvider>
    </div>
  );
}
