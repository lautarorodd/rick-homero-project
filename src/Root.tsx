import {Composition} from 'remotion';
import {Cover} from './reel8b/Cover';
import {REEL8B_FRAMES, Reel} from './reel8b/Reel';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HomeroReel8B" component={Reel} durationInFrames={REEL8B_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CoverReel8B" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
