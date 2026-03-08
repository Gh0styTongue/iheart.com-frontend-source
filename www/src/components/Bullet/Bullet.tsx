import BulletStyles from './BulletStyles';

function Bullet() {
  return (
    <BulletStyles data-test="bullet">{String.fromCharCode(8226)}</BulletStyles>
  );
}

export default Bullet;
