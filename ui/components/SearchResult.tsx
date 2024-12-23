import Image from 'next/image';

interface SearchResultProps {
  message: string;
  sources: any[];
  imageUrl?: string;
  metadata?: {
    width: number;
    height: number;
  };
}

export const SearchResult: React.FC<SearchResultProps> = ({
  message,
  sources,
  imageUrl,
  metadata
}) => {
  return (
    <div className="space-y-4">
      <div className="prose">{message}</div>
      
      {imageUrl && (
        <div className="mt-4">
          <div className="relative">
            <Image
              src={imageUrl}
              alt="Generated Image"
              width={metadata?.width || 800}
              height={metadata?.height || 400}
              className="rounded-lg shadow-lg"
            />
          </div>
          <a 
            href={imageUrl}
            download
            className="mt-2 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            下载图片
          </a>
        </div>
      )}
      
      {/* 显示来源 */}
      <div className="mt-4 space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="text-sm text-gray-600">
            {source.title} - <a href={source.url}>{source.url}</a>
          </div>
        ))}
      </div>
    </div>
  );
}; 