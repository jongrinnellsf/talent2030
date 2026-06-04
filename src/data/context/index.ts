import { getObservationSections } from "./workObservations";
import { getDeliveryPlaybook } from "./deliveryPlaybooks";
import { getManagerReview, managerReviews } from "./managerReviews";
import { getSelfReview, selfReviews } from "./selfReviews";

export function getContextForEmployee(employeeId: string) {
  const selfReview = selfReviews[employeeId];
  const managerReview = managerReviews[employeeId];
  const observationSections = getObservationSections(employeeId);
  const deliveryPlaybook = getDeliveryPlaybook(employeeId);
  const observationCount = observationSections.reduce(
    (sum, section) => sum + section.items.length,
    0
  );

  if (!selfReview || !managerReview) {
    return {
      employeeId,
      selfReview: getSelfReview(employeeId),
      managerReview: getManagerReview(employeeId),
      deliveryPlaybook,
      observationSections,
      signalCount: observationCount,
    };
  }

  return {
    employeeId,
    selfReview,
    managerReview,
    deliveryPlaybook,
    observationSections,
    signalCount: observationCount + 2,
  };
}
