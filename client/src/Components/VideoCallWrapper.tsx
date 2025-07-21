// VideoCallWrapper.tsx

import { useParams, useNavigate } from "react-router-dom";
import VideoCall from "./VideoCall";

interface Props {
  channelName?: string;
  uid?: number;
  onEnd?: () => void;
}

export default function VideoCallWrapper({ channelName, uid, onEnd }: Props) {
  const params = useParams();
  const navigate = useNavigate();

  const resolvedChannelName = channelName ?? params.channelName;
  const resolvedUid = uid ?? (params.uid ? parseInt(params.uid) : undefined);

  if (!resolvedChannelName || resolvedUid === undefined) {
    return <div>Invalid call parameters</div>;
  }

  return (
    <VideoCall
      channelName={resolvedChannelName}
      uid={resolvedUid}
      onEnd={onEnd ?? (() => navigate(-1))}
    />
  );
}
