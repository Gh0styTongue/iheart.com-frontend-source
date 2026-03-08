import { isPrivacyOptOut } from 'trackers/privacyOptOut';
import { useSelector } from 'react-redux';

const useCCPAOptOut = () => useSelector(isPrivacyOptOut);

export default useCCPAOptOut;
