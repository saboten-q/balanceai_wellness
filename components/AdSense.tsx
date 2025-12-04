import { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AdSense = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = '',
  style = {}
}: AdSenseProps) => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (window && clientId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [clientId]);

  // AdSenseが設定されていない場合は何も表示しない
  if (!clientId || import.meta.env.VITE_ENV === 'development') {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

// ヘッダーに追加するAdSenseスクリプト
export const AdSenseScript = () => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  if (!clientId || import.meta.env.VITE_ENV === 'development') {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
};

// 特定の広告フォーマット用のコンポーネント

// ダッシュボード用の横長広告
export const DashboardAd = () => (
  <AdSense
    slot="YOUR_DASHBOARD_SLOT_ID" // 実際のSlot IDに置き換え
    format="horizontal"
    className="my-4"
  />
);

// 食事ログ間のインフィード広告
export const InFeedAd = () => (
  <AdSense
    slot="YOUR_INFEED_SLOT_ID" // 実際のSlot IDに置き換え
    format="fluid"
    className="my-3"
  />
);

// サイドバー用の縦長広告
export const SidebarAd = () => (
  <AdSense
    slot="YOUR_SIDEBAR_SLOT_ID" // 実際のSlot IDに置き換え
    format="vertical"
    className="my-4"
  />
);

