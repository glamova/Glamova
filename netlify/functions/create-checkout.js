const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  if (!process.env.STRIPE_SECRET_KEY) return { statusCode: 503, body: JSON.stringify({ error: 'Le paiement Stripe doit encore être connecté.' }) };
  try {
    const { items } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error('Panier invalide');
    const line_items = items.map(item => {
      if (!/^price_[A-Za-z0-9]+$/.test(item.price) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) throw new Error('Article invalide');
      return { price: item.price, quantity: item.quantity };
    });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const prices = await Promise.all(line_items.map(item => stripe.prices.retrieve(item.price)));
    const merchandiseTotal = prices.reduce((sum, price, index) => {
      if (price.currency !== 'eur' || !Number.isInteger(price.unit_amount)) throw new Error('Le prix Stripe doit être un montant fixe en euros.');
      return sum + price.unit_amount * line_items[index].quantity;
    }, 0);
    const shipping_options = merchandiseTotal >= 8000
      ? [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'eur' }, display_name: 'Livraison offerte', delivery_estimate: { minimum: { unit: 'business_day', value: 3 }, maximum: { unit: 'business_day', value: 7 } } } }]
      : [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 490, currency: 'eur' }, display_name: 'Livraison standard', delivery_estimate: { minimum: { unit: 'business_day', value: 3 }, maximum: { unit: 'business_day', value: 7 } } } }];
    const origin = process.env.PUBLIC_SITE_URL || event.headers.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', line_items, allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ['FR','BE','LU','CH','MC'] },
      shipping_options,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#nouveautes`,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'required',
      locale: 'fr'
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: session.url }) };
  } catch (error) { return { statusCode: 400, body: JSON.stringify({ error: error.message || 'Paiement indisponible' }) }; }
};
