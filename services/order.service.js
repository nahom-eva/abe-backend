const conn = require("../config/db.config");
const crypto = require("crypto");

// Generate order hash
const generateOrderHash = () => {
  return crypto
    .createHash("sha256")
    .update(crypto.randomBytes(32).toString("hex"))
    .digest("hex");
};

async function createOrder(orderData) {
  try {
    // 1. Create Order
    const orderHash = generateOrderHash();
    const orderResult = await conn.query(
      `INSERT INTO orders 
           (order_hash, employee_id, customer_id, vehicle_id, order_date, active_order)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`, // Add order_date explicitly
      [
        orderHash,
        orderData.employee_id,
        orderData.customer_id,
        orderData.vehicle_id,
        0, // Now correctly maps to active_order
      ]
    );
    const orderId = orderResult.insertId;
    console.log(orderId);
    // 2. Create Order Status
    await conn.query(
      `INSERT INTO order_status 
       (order_id, order_status)
       VALUES (?, 1)`,
      [orderId]
    );

    // 3. Insert Selected Services into order_services
    if (orderData.order_services && orderData.order_services.length > 0) {
      // Map the order services into a flat array with individual values for the placeholders
      const orderServiceValues = orderData.order_services
        .map((service) => [orderId, service.service_id, 0])
        .flat(); // Flatten the array to match the query's placeholders

      const placeholders = orderData.order_services
        .map(() => "(?, ?, ?)") // Generates the placeholders for each service
        .join(", "); // Joins them into a single string

      // Use the generated placeholders in the query
      await conn.query(
        `INSERT INTO order_services (order_id, service_id, service_completed) 
     VALUES ${placeholders}`,
        orderServiceValues // Pass the flat array with the actual values
      );
    }

    // 4. Create Order Info (including additional_request if present)
    await conn.query(
      `INSERT INTO order_info 
       (order_id, order_total_price,  additional_request, additional_requests_completed)
       VALUES (?, ?,?,0)`,
      [
        orderId,
        orderData.totalPrice,
        orderData.additional_service_description || null,
      ]
    );

    return { success: true, orderId, orderHash };
  } catch (error) {
    console.error("Order creation failed:", error.message);
    return { success: false, error: error.message };
  }
}

async function getAllOrders() {
  try {
    const query = `
     SELECT 
    o.order_id,
    o.order_hash,
    MAX(o.order_date) AS order_date,  -- Use MAX instead of ANY_VALUE
    MAX(o.active_order) AS active_order,
    MAX(v.vehicle_year) AS vehicle_year,
    MAX(v.vehicle_make) AS vehicle_make,
    MAX(v.vehicle_model) AS vehicle_model,
    MAX(v.vehicle_color) AS vehicle_color,
    MAX(v.vehicle_mileage) AS vehicle_mileage,
    MAX(v.vehicle_serial) AS vehicle_serial,
    MAX(v.vehicle_tag) AS vehicle_tag,
    MAX(ci.customer_first_name) AS customer_first_name,
    MAX(ci.customer_last_name) AS customer_last_name,
    MAX(CONCAT(ci.customer_first_name, ' ', ci.customer_last_name)) AS customer_name,
    MAX(c.customer_email) AS customer_email,
    MAX(c.customer_phone_number) AS customer_phone_number,
    MAX(CONCAT(ei.employee_first_name, ' ', ei.employee_last_name)) AS employee_name,
    MAX(oi.order_total_price) AS order_total_price,
    MAX(oi.estimated_completion_date) AS estimated_completion_date,
    MAX(oi.additional_request) AS additional_request,
    MAX(oi.additional_requests_completed) AS additional_requests_completed,
    GROUP_CONCAT(
        CONCAT(cs.service_id, ':', cs.service_name, ':', os.service_completed) 
        SEPARATOR ', '
    ) AS services
FROM orders o
JOIN customer_vehicle_info v ON o.vehicle_id = v.vehicle_id
JOIN customer_identifier c ON o.customer_id = c.customer_id
JOIN customer_info ci ON c.customer_id = ci.customer_id
JOIN employee emp ON o.employee_id = emp.employee_id
JOIN employee_info ei ON emp.employee_id = ei.employee_id
LEFT JOIN order_info oi ON o.order_id = oi.order_id
LEFT JOIN order_services os ON o.order_id = os.order_id
LEFT JOIN common_services cs ON os.service_id = cs.service_id
GROUP BY o.order_id
ORDER BY order_date DESC;
`;

    const orders = await conn.query(query);
    return orders.map((order) => ({
      ...order,
      services: order.services
        ? order.services.split(", ").map((service) => {
            const [service_id, service_name, service_completed] =
              service.split(":");
            return {
              service_id: parseInt(service_id),
              service_name,
              service_completed: parseInt(service_completed),
            };
          })
        : [],
    }));
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    throw error;
  }
}
async function getCustomerOrders(customerId) {
  try {
    const query = `
      SELECT
    MAX(o.order_id) AS order_id,
    MAX(o.order_hash) AS order_hash, 
    MAX(o.order_date) AS order_date,
    MAX(o.active_order) AS active_order,
    MAX(v.vehicle_year) AS vehicle_year,
    MAX(v.vehicle_make) AS vehicle_make,
    MAX(v.vehicle_model) AS vehicle_model,
    MAX(v.vehicle_color) AS vehicle_color,
    MAX(v.vehicle_mileage) AS vehicle_mileage,
    MAX(v.vehicle_serial) AS vehicle_serial,
    MAX(v.vehicle_tag) AS vehicle_tag,
    MAX(CONCAT(ci.customer_first_name, ' ', ci.customer_last_name)) AS customer_name,
    MAX(c.customer_email) AS customer_email,
    MAX(c.customer_phone_number) AS customer_phone_number,
    MAX(CONCAT(ei.employee_first_name, ' ', ei.employee_last_name)) AS employee_name,
    MAX(oi.order_total_price) AS order_total_price,
    MAX(oi.additional_request) AS additional_request,
    MAX(oi.estimated_completion_date) AS estimated_completion_date,
    MAX(oi.additional_requests_completed) AS additional_requests_completed,
    GROUP_CONCAT(DISTINCT CONCAT(cs.service_id, ':', cs.service_name) SEPARATOR ', ') AS services
FROM orders o
JOIN customer_vehicle_info v ON o.vehicle_id = v.vehicle_id
JOIN customer_identifier c ON o.customer_id = c.customer_id
JOIN customer_info ci ON c.customer_id = ci.customer_id
JOIN employee emp ON o.employee_id = emp.employee_id
JOIN employee_info ei ON emp.employee_id = ei.employee_id
LEFT JOIN order_info oi ON o.order_id = oi.order_id
LEFT JOIN order_services os ON o.order_id = os.order_id
LEFT JOIN common_services cs ON os.service_id = cs.service_id
WHERE o.customer_id = ?
GROUP BY o.order_id
ORDER BY o.order_date DESC;
`;

    const orders = await conn.query(query, [customerId]);
    return orders.map((order) => ({
      ...order,
      services: order.services
        ? order.services.split(", ").map((service) => {
            const [id, name] = service.split(":");
            return { service_id: Number(id), service_name: name };
          })
        : [],
    }));
  } catch (error) {
    console.error("Error fetching customer orders:", error.message);
    throw error;
  }
}

async function updateOrder(orderId, orderData) {
  try {
    // 1. Remove existing services (this doesn't affect order_info table)
    await conn.query(`DELETE FROM order_services WHERE order_id = ?`, [
      orderId,
    ]);
    console.log(`${orderData.additional_requests}`);
    // 2. Add new services if any exist
    if (orderData.services?.length > 0) {
      const serviceValues = orderData.services.map((service) => [
        orderId,
        service.service_id,
        service.service_completed,
      ]);

      // Create dynamic placeholders for bulk insert
      const placeholders = serviceValues.map(() => "(?, ?, ?)").join(", ");
      const flatValues = serviceValues.flat();

      await conn.query(
        `INSERT INTO order_services (order_id, service_id, service_completed) 
         VALUES ${placeholders}`,
        flatValues
      );
    }

    // 3. Update order_info with proper additional request handling
    const updateParams = {
      order_total_price: orderData.totalPrice,
      received: orderData.order_received,
      additional_request: orderData.additional_request ?? null, // Use NULL if undefined
      additional_requests_completed:
        orderData.additional_requests_completed || 1, // Ensure integer
    };
    console.log(updateParams.additional_requests_completed);
    await conn.query(
      `UPDATE order_info 
       SET order_total_price = ?,
           additional_request = COALESCE(?, additional_request),
           additional_requests_completed = ?
       WHERE order_id = ?`,
      [
        updateParams.order_total_price,
        updateParams.additional_request,
        updateParams.additional_requests_completed,
        orderId,
      ]
    );
    console.log(updateParams.additional_request);

    // 4. Update order active status
    function allServicesCompleted() {
      if (updateParams.received === 2) {
        return 2;
      } else if (updateParams.additional_request === null) {
        return orderData.services?.every((s) => s.service_completed === 1)
          ? 1
          : 0;
      } else {
        return orderData.services?.every((s) => s.service_completed === 1) &&
          orderData.additional_requests_completed === 1
          ? 1
          : 0;
      }
    }
    orderStatus = allServicesCompleted();
    console.log(orderStatus);

    await conn.query(`UPDATE orders SET active_order = ? WHERE order_id = ?`, [
      orderStatus,
      orderId,
    ]);

    return { success: true };
  } catch (error) {
    console.error("Order update failed:", error.message);
    return { success: false, error: "Order update failed" };
  }
}

// Service to track the order
async function trackOrder(orderHash) {
  try {
    const query = `
      SELECT 
        c.customer_email,
        c.customer_phone_number,
        ci.customer_first_name,
        ci.customer_last_name,
        v.vehicle_year,
        v.vehicle_make,
        v.vehicle_model,
        v.vehicle_type,
        v.vehicle_mileage,
        v.vehicle_tag,
        v.vehicle_serial,
        v.vehicle_color,
        o.order_date,
        o.active_order,
        oi.order_total_price,
        oi.estimated_completion_date,
        oi.completion_date,
        oi.additional_request,
        oi.notes_for_customer,
        oi.additional_requests_completed,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'service_name', s.service_name,
              'service_description', s.service_description,
              'service_price', s.service_price,
              'service_completed', os.service_completed
            )
          ), '[]'
        ) AS services
      FROM orders o
      JOIN customer_identifier c ON o.customer_id = c.customer_id
      JOIN customer_info ci ON c.customer_id = ci.customer_id
      JOIN customer_vehicle_info v ON o.vehicle_id = v.vehicle_id
      LEFT JOIN order_services os ON o.order_id = os.order_id
      LEFT JOIN common_services s ON os.service_id = s.service_id
      LEFT JOIN order_info oi ON o.order_id = oi.order_id
      WHERE o.order_hash = ?
      GROUP BY o.order_id, c.customer_email, c.customer_phone_number, ci.customer_first_name, 
               ci.customer_last_name, v.vehicle_year, v.vehicle_make, v.vehicle_model, 
               v.vehicle_type, v.vehicle_mileage, v.vehicle_tag, v.vehicle_serial, v.vehicle_color, 
               o.order_date, o.active_order, oi.order_total_price, oi.estimated_completion_date, 
               oi.completion_date, oi.additional_request, oi.notes_for_customer, 
               oi.additional_requests_completed;
    `;

    const results = await conn.query(query, [orderHash]);

    if (!results.length) {
      return null;
    }

    const orderData = {
      ...results[0],
      services: JSON.parse(results[0].services || "[]"),
    };

    return orderData;
  } catch (error) {
    console.error("Error tracking order:", error);
    throw new Error("Failed to retrieve order details");
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  updateOrder,
  trackOrder,
};
