SELECT
          dld.id AS donationLocationDateId,
          dld.dateOpen,
          dld.dateClose,
          dl.id AS donationLocationId,
          dl.name AS donationLocationName,
          dl.schedulingUrl AS donationLocationSchedulingUrl,
          a.id AS addressId,
          a.city AS addressCity,
          a.street AS addressStreet,
          a.number AS addressNumber
      FROM
          DonationLocationDate dld
      JOIN
          DonationLocation dl ON dld.donationLocationId = dl.id
      JOIN
          Address a ON dl.addressId = a.id;