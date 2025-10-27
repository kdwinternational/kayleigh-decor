<?php
/**
 * Kayleigh Decor Warehouse - Distance-Based Shipping Calculator
 * Add this code to Code Snippets plugin or child theme functions.php
 */

// Add delivery postcode field to checkout
add_filter( 'woocommerce_checkout_fields', 'kayleigh_add_postcode_field' );
function kayleigh_add_postcode_field( $fields ) {
    $fields['shipping']['delivery_postcode'] = array(
        'label' => 'Delivery Postcode',
        'placeholder' => 'e.g. 5247',
        'required' => true,
        'class' => array( 'form-row-wide' ),
        'clear' => true,
        'priority' => 25
    );
    return $fields;
}

// Calculate shipping based on distance
add_action( 'woocommerce_cart_calculate_fees', 'kayleigh_calculate_distance_shipping' );
function kayleigh_calculate_distance_shipping() {
    // Only run on checkout/cart pages
    if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
        return;
    }
    
    // Get delivery postcode from session or POST
    $delivery_postcode = '';
    if ( isset( $_POST['post_data'] ) ) {
        parse_str( $_POST['post_data'], $post_data );
        if ( isset( $post_data['delivery_postcode'] ) ) {
            $delivery_postcode = sanitize_text_field( $post_data['delivery_postcode'] );
            WC()->session->set( 'delivery_postcode', $delivery_postcode );
        }
    } elseif ( WC()->session->get( 'delivery_postcode' ) ) {
        $delivery_postcode = WC()->session->get( 'delivery_postcode' );
    }
    
    if ( empty( $delivery_postcode ) ) {
        return;
    }
    
    // Store origin postcode (Kayleigh Decor Warehouse)
    $origin_postcode = '5201'; // Quigney, East London
    
    // Check if we have distance cached
    $cache_key = 'kayleigh_distance_' . $origin_postcode . '_' . $delivery_postcode;
    $distance_km = get_transient( $cache_key );
    
    if ( false === $distance_km ) {
        // API call to get distance
        $api_url = 'https://postcode.distance.dev/distance';
        $response = wp_remote_get( add_query_arg( array(
            'from' => $origin_postcode,
            'to' => $delivery_postcode
        ), $api_url ), array( 'timeout' => 15 ) );
        
        if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
            $data = json_decode( wp_remote_retrieve_body( $response ), true );
            if ( isset( $data['distance_km'] ) ) {
                $distance_km = floatval( $data['distance_km'] );
                // Cache for 24 hours
                set_transient( $cache_key, $distance_km, DAY_IN_SECONDS );
            }
        }
    }
    
    if ( ! $distance_km ) {
        // Fallback: use default shipping if API fails
        return;
    }
    
    // Calculate shipping cost based on distance
    $shipping_cost = 0;
    
    if ( $distance_km <= 40 ) {
        // Local delivery (0-40km)
        $shipping_cost = 0;
    } elseif ( $distance_km <= 100 ) {
        // Regional (41-100km) - R8 per km
        $shipping_cost = $distance_km * 8;
    } elseif ( $distance_km <= 400 ) {
        // Long distance (101-400km) - R6 per km
        $shipping_cost = $distance_km * 6;
    } else {
        // Very long distance (400km+) - R5 per km
        $shipping_cost = $distance_km * 5;
    }
    
    // Check for bulky items (sofas, security gates)
    $has_bulky_item = false;
    foreach ( WC()->cart->get_cart() as $cart_item ) {
        $product = $cart_item['data'];
        if ( has_term( array( 'sofas', 'security-gates' ), 'product_cat', $product->get_id() ) ) {
            $has_bulky_item = true;
            break;
        }
    }
    
    // Cap shipping at R1200 for bulky items
    if ( $has_bulky_item && $shipping_cost > 1200 ) {
        $shipping_cost = 1200;
    }
    
    // Add shipping as a fee
    if ( $shipping_cost > 0 ) {
        WC()->cart->add_fee( 'Delivery Fee', $shipping_cost, true );
    }
    
    // Add zero-cost option for collection
    // This will be handled separately in checkout options
}

// Add collection option to checkout
add_action( 'woocommerce_after_shipping_rate', 'kayleigh_add_collection_option', 10, 2 );
function kayleigh_add_collection_option( $method, $index ) {
    if ( 'local_pickup' === $method->method_id ) {
        echo '<p style="margin-top: 10px; font-size: 0.9em; color: #666;">Collect at 66a Fleet Street, Quigney, East London 5201</p>';
    }
}

// Display distance info on checkout
add_action( 'woocommerce_review_order_before_shipping', 'kayleigh_display_distance_info' );
function kayleigh_display_distance_info() {
    $delivery_postcode = WC()->session->get( 'delivery_postcode' );
    if ( $delivery_postcode ) {
        $origin_postcode = '5201';
        $cache_key = 'kayleigh_distance_' . $origin_postcode . '_' . $delivery_postcode;
        $distance_km = get_transient( $cache_key );
        
        if ( $distance_km ) {
            echo '<div style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #ddd;">';
            echo '<p><strong>Delivery Distance:</strong> ' . number_format( $distance_km, 1 ) . ' km from East London</p>';
            echo '</div>';
        }
    }
}

// Handle local pickup option
add_filter( 'woocommerce_package_rates', 'kayleigh_handle_local_pickup', 10, 2 );
function kayleigh_handle_local_pickup( $rates, $package ) {
    // Add local pickup option if not already present
    if ( ! isset( $rates['local_pickup:1'] ) ) {
        $rates['local_pickup:1'] = new WC_Shipping_Rate( 'local_pickup:1', 'Collect at Factory (Free)', 0, array(), 'local_pickup' );
    }
    return $rates;
}

// Clear postcode session on order completion
add_action( 'woocommerce_thankyou', 'kayleigh_clear_postcode_session' );
function kayleigh_clear_postcode_session( $order_id ) {
    WC()->session->__unset( 'delivery_postcode' );
}

// Add admin notice if API limit reached
add_action( 'admin_notices', 'kayleigh_check_api_limits' );
function kayleigh_check_api_limits() {
    $transient_count = get_option( 'kayleigh_api_calls_today', 0 );
    if ( $transient_count > 80 ) { // Warning at 80% of limit
        echo '<div class="notice notice-warning"><p>';
        echo 'Warning: Distance API approaching daily limit (80/100 calls). Consider upgrading or implementing caching improvements.';
        echo '</p></div>';
    }
}

// Track API calls
function kayleigh_track_api_call() {
    $today = date( 'Y-m-d' );
    $option_name = 'kayleigh_api_calls_' . $today;
    $count = get_option( $option_name, 0 );
    update_option( $option_name, $count + 1 );
    
    // Clean up old data (keep last 7 days)
    $old_date = date( 'Y-m-d', strtotime( '-7 days' ) );
    delete_option( 'kayleigh_api_calls_' . $old_date );
}

// Display shipping info on product pages
add_action( 'woocommerce_single_product_summary', 'kayleigh_display_shipping_info', 25 );
function kayleigh_display_shipping_info() {
    echo '<div style="margin-top: 15px; padding: 10px; background: #f0f0f0; border-left: 4px solid #C9A227;">';
    echo '<p><strong>Delivery:</strong> Calculate shipping at checkout based on your postcode</p>';
    echo '<p><strong>Local Collection:</strong> Free collection from 66a Fleet Street, Quigney</p>';
    echo '</div>';
}

// Shortcode for shipping calculator
add_shortcode( 'kayleigh_shipping_calculator', 'kayleigh_shipping_calculator_shortcode' );
function kayleigh_shipping_calculator_shortcode() {
    ob_start();
    ?>
    <div class="shipping-calculator">
        <h3>Calculate Delivery Cost</h3>
        <form id="shipping-calculator-form">
            <p>
                <label for="calc-postcode">Your Postcode:</label>
                <input type="text" id="calc-postcode" name="postcode" placeholder="e.g. 5247" maxlength="4" pattern="[0-9]{4}" required>
            </p>
            <button type="submit">Calculate</button>
        </form>
        <div id="shipping-result" style="margin-top: 15px; display: none;"></div>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        $('#shipping-calculator-form').on('submit', function(e) {
            e.preventDefault();
            var postcode = $('#calc-postcode').val();
            
            $.ajax({
                url: '<?php echo admin_url('admin-ajax.php'); ?>',
                type: 'POST',
                data: {
                    action: 'kayleigh_calculate_shipping',
                    postcode: postcode
                },
                success: function(response) {
                    $('#shipping-result').html(response).show();
                }
            });
        });
    });
    </script>
    <?php
    return ob_get_clean();
}

// AJAX handler for shipping calculator
add_action( 'wp_ajax_kayleigh_calculate_shipping', 'kayleigh_ajax_shipping_calculator' );
add_action( 'wp_ajax_nopriv_kayleigh_calculate_shipping', 'kayleigh_ajax_shipping_calculator' );
function kayleigh_ajax_shipping_calculator() {
    $postcode = sanitize_text_field( $_POST['postcode'] );
    
    if ( empty( $postcode ) || strlen( $postcode ) != 4 ) {
        echo '<p style="color: red;">Please enter a valid 4-digit postcode.</p>';
        wp_die();
    }
    
    // Use same logic as main shipping calculator
    $origin_postcode = '5201';
    $cache_key = 'kayleigh_distance_' . $origin_postcode . '_' . $postcode;
    $distance_km = get_transient( $cache_key );
    
    if ( false === $distance_km ) {
        $api_url = 'https://postcode.distance.dev/distance';
        $response = wp_remote_get( add_query_arg( array(
            'from' => $origin_postcode,
            'to' => $postcode
        ), $api_url ), array( 'timeout' => 15 ) );
        
        if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
            $data = json_decode( wp_remote_retrieve_body( $response ), true );
            if ( isset( $data['distance_km'] ) ) {
                $distance_km = floatval( $data['distance_km'] );
                set_transient( $cache_key, $distance_km, DAY_IN_SECONDS );
            }
        }
    }
    
    if ( $distance_km ) {
        // Calculate cost
        $cost = 0;
        if ( $distance_km <= 40 ) {
            $cost = 0;
        } elseif ( $distance_km <= 100 ) {
            $cost = $distance_km * 8;
        } elseif ( $distance_km <= 400 ) {
            $cost = $distance_km * 6;
        } else {
            $cost = $distance_km * 5;
        }
        
        echo '<div style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd;">';
        echo '<p><strong>Distance:</strong> ' . number_format( $distance_km, 1 ) . ' km from East London</p>';
        if ( $cost > 0 ) {
            echo '<p><strong>Estimated Delivery:</strong> R' . number_format( $cost, 2 ) . '</p>';
        } else {
            echo '<p><strong>Delivery:</strong> FREE (Local delivery)</p>';
        }
        echo '<p><em>Final cost calculated at checkout. Bulky items may have different rates.</em></p>';
        echo '</div>';
    } else {
        echo '<p style="color: red;">Unable to calculate distance. Please try again or contact us.</p>';
    }
    
    wp_die();
}

// Add settings link in admin
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'kayleigh_add_settings_link' );
function kayleigh_add_settings_link( $links ) {
    $links[] = '<a href="' . admin_url( 'options-general.php?page=code-snippets' ) . '">Settings</a>';
    return $links;
}
