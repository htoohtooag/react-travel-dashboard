import { GoogleGenAI } from '@google/genai';
import { ID } from 'appwrite';
import { data, type ActionFunctionArgs } from 'react-router';
import { appwriteConfig, tablesDB } from '~/appwrite/client';
import { createProduct } from '~/lib/stripe';
import { parseMarkdownToJson, parseTripData } from '~/lib/utils';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { country, numberOfDays, travelStyle, interests, budget, groupType, userId } = await request.json();


  const genAI = new GoogleGenAI({});
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const prompt = `
        Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${interests},
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          '🌸 Season (from month to month): reason to visit',
          '☀️ Season (from month to month): reason to visit',
          '🍁 Season (from month to month): reason to visit',
          '❄️ Season (from month to month): reason to visit'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        },
        ...
        ]
    }`;

    const model = process.env.GEMINI_API_MODEL;
    if (!model) {
      throw new Error("GEMINI_API_MODEl is not defined in env varibale.")
    }
    const textResult = await genAI.models.generateContent({
      model: model,
      contents: prompt
    });

    if (!textResult || !textResult.text) {
      console.log("Gemini returned empty result");
      return data({ status: 500, message: "Failed to generate itinerary: AI retruned no contents." })
    };

    // const trip = JSON.parse(textResult.text);
    const trip = parseMarkdownToJson(textResult.text);
    console.log("typeof trips content come from the ai ", typeof trip)

    let imageUrls: string[] = [];

    try {
      const query = encodeURIComponent(`${country} ${interests} ${travelStyle}`); //. beaches%20%26%20islands 
      const imageResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=5&client_id=${unsplashApiKey}`
      );

      if (!imageResponse.ok) {
        console.warn(`Unsplash API failed with status: ${imageResponse.status}`);
        return data({ message: "Failed to fetch destination images.", status: 502 });
      }

      const imageData = await imageResponse.json();

      if (imageData.results && Array.isArray(imageData.results)) {
        imageUrls = imageData.results
          .slice(0, 4)
          .map((result: any) => result.urls?.regular || null)
      };

    } catch (fetchError) {
      console.error("Network error fetching images", fetchError);
      return data({ message: "Network error while fetching images.", status: 503 });
    }


    const result = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tripTableId,
      rowId: ID.unique(),
      data: {
        tripDetails: JSON.stringify(trip),
        imageUrls,
        userId,
      }
    });

    const tripDetail = parseTripData(result.tripDetails) as Trip;
    const tripPrice = parseInt(tripDetail.estimatedPrice.replace('$', ''), 10);
    const paymentLink = await createProduct(
      tripDetail.name, 
      tripDetail.description, 
      imageUrls, 
      tripPrice, 
      result.$id
    ); 
    console.log("paymentlink after crete the produt", paymentLink)

    await tablesDB.updateRow({
      databaseId: appwriteConfig.databaseId, 
      tableId: appwriteConfig.tripTableId,
      rowId: result.$id, 
      data: {
        payment_link: paymentLink.url
      }
    })

    return data({ status: 201, id: result.$id });
    // return data({stauts: 201})

  } catch (e) {
    console.error("Error generatin travel plan: ", e)
  }
}



//=> UnSplash data 
// const imagedatas = await imageResponse.json();
// console.log(imagedatas, "images data from splashs");
// {
//     total: 6534,
//         total_pages: 654,
//             results: [
//                 {
//                     id: 'HH7p4uj4Ka4',
//                     slug: 'a-bird-sitting-on-top-of-a-log-in-the-ocean-HH7p4uj4Ka4',
//                     alternative_slugs: [Object],
//                     created_at: '2023-01-27T08:11:47Z',
//                     updated_at: '2026-01-07T12:59:32Z',
//                     promoted_at: null,
//                     width: 4457,
//                     height: 2770,
//                     color: '#405959',
//                     blur_hash: 'LGCHH5-UIVNaMJtRRiV@009Zxvxt',
//                     description: '@MTT Photography',
//                     alt_description: 'a bird sitting on top of a log in the ocean',
//                     breadcrumbs: [],
//                     urls: [Object],
//                     links: [Object],
//                     likes: 0,
//                     liked_by_user: false,
//                     bookmarked: false,
//                     current_user_collections: [],
//                     sponsorship: null,
//                     topic_submissions: {},
//                     asset_type: 'photo',
//                     user: [Object]
//                 },
//                 {
//                     id: 'd0WliTF-uyU',
//                     slug: 'brown-shore-rocks-with-body-of-water-d0WliTF-uyU',
//                     alternative_slugs: [Object],
//                     created_at: '2017-09-26T04:38:57Z',
//                     updated_at: '2026-01-07T15:34:16Z',
//                     promoted_at: '2017-09-26T10:10:40Z',
//                     width: 4620,
//                     height: 3463,
//                     color: '#595959',
//                     blur_hash: 'LSB}B[D$bas:ysM_oLazD$tRV@Rj',
//                     description: 'There’s not a lot of places where you can expect to see pristine clean water as the beaches in Ngapali. I had the chance to revisit Ngapali, one of the best beaches in Myanmar after roughly 10 years from my last visit and the waters still looked fantastic! Had I not traveled with my drone, I would have only been able to imagine a scene like this.',
//                     alt_description: 'brown shore rocks with body of water',
//                     breadcrumbs: [],
//                     urls: [Object],
//                     links: [Object],
//                     likes: 252,
//                     liked_by_user: false,
//                     bookmarked: false,
//                     current_user_collections: [],
//                     sponsorship: null,
//                     topic_submissions: {},
//                     asset_type: 'photo',
//                     user: [Object]
//                 },
// ................
//             ]
// }

//=> urls format from Unspalsh
// {
//     raw: 'https://images.unsplash.com/photo-1612258000416-4954d59f98c9?ixid=M3w4NTM4ODZ8MHwxfHNlYXJjaHwxfHxNeWFubWFyJTIwUGhvdG9ncmFwaHklMjBTcG90cyUyMEx1eHVyeXxlbnwwfHx8fDE3Njc4MDkzNjR8MA&ixlib=rb-4.1.0',
//     full: 'https://images.unsplash.com/photo-1612258000416-4954d59f98c9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTM4ODZ8MHwxfHNlYXJjaHwxfHxNeWFubWFyJTIwUGhvdG9ncmFwaHklMjBTcG90cyUyMEx1eHVyeXxlbnwwfHx8fDE3Njc4MDkzNjR8MA&ixlib=rb-4.1.0&q=85',
//     regular: 'https://images.unsplash.com/photo-1612258000416-4954d59f98c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTM4ODZ8MHwxfHNlYXJjaHwxfHxNeWFubWFyJTIwUGhvdG9ncmFwaHklMjBTcG90cyUyMEx1eHVyeXxlbnwwfHx8fDE3Njc4MDkzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     small: 'https://images.unsplash.com/photo-1612258000416-4954d59f98c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTM4ODZ8MHwxfHNlYXJjaHwxfHxNeWFubWFyJTIwUGhvdG9ncmFwaHklMjBTcG90cyUyMEx1eHVyeXxlbnwwfHx8fDE3Njc4MDkzNjR8MA&ixlib=rb-4.1.0&q=80&w=400',
//     thumb: 'https://images.unsplash.com/photo-1612258000416-4954d59f98c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NTM4ODZ8MHwxfHNlYXJjaHwxfHxNeWFubWFyJTIwUGhvdG9ncmFwaHklMjBTcG90cyUyMEx1eHVyeXxlbnwwfHx8fDE3Njc4MDkzNjR8MA&ixlib=rb-4.1.0&q=80&w=200',
//     small_s3: 'https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1612258000416-4954d59f98c9'
//   } urls object from unsplash


// -----------------
// paymentlink after crete the produt {
//   id: 'plink_1Sp1LwHNpUXoOwoDUOpmmjv3',
//   object: 'payment_link',
//   active: true,
//   after_completion: {
//     redirect: {
//       url: 'http://localhost:5173/travel/6965e9fe003c255e2776/success'
//     },
//     type: 'redirect'
//   },
//   allow_promotion_codes: false,
//   application: null,
//   application_fee_amount: null,
//   application_fee_percent: null,
//   automatic_tax: { enabled: false, liability: null },
//   billing_address_collection: 'auto',
//   consent_collection: null,
//   currency: 'usd',
//   custom_fields: [],
//   custom_text: {
//     after_submit: null,
//     shipping_address: null,
//     submit: null,
//     terms_of_service_acceptance: null
//   },
//   customer_creation: 'if_required',
//   inactive_message: null,
//   invoice_creation: {
//     enabled: false,
//     invoice_data: {
//       account_tax_ids: null,
//       custom_fields: null,
//       description: null,
//       footer: null,
//       issuer: null,
//       metadata: {},
//       rendering_options: null
//     }
//   },
//   livemode: false,
//   metadata: { tripId: '6965e9fe003c255e2776' },
//   on_behalf_of: null,
//   payment_intent_data: null,
//   payment_method_collection: 'if_required',
//   payment_method_types: null,
//   phone_number_collection: { enabled: false },
//   restrictions: null,
//   shipping_address_collection: null,
//   shipping_options: [],
//   submit_type: 'auto',
//   subscription_data: null,
//   tax_id_collection: { enabled: false, required: 'never' },
//   transfer_data: null,
//   url: 'https://buy.stripe.com/test_7sY5kD4825zX06B5r38Zq02'
// }