import { InfoPill, Tripcard } from 'components'
import React from 'react'
import { Link } from 'react-router'
import type { Route } from './+types/travel-detail'
import { getAllTrips, getTripById } from '~/appwrite/trips'
import { getFirstWord, parseTripData } from '~/lib/utils'
import { ButtonComponent, ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { tripId } = params;
  if (!tripId) throw new Error("Trips ID is required");

  const [trip, trips] = await Promise.all([
    getTripById(tripId),
    getAllTrips(4, 0)
  ]);

  return {
    trip,
    allTrips: trips.allTrips.map(({ $id, tripDetails, imageUrls }) => ({
      id: $id,
      ...parseTripData(tripDetails),
      imageUrls: imageUrls ?? []
    }))
  };
}

const TravelDetail = ({ loaderData }: Route.ComponentProps) => {
  const { trip, allTrips } = loaderData;
  const tripData = parseTripData(trip?.tripDetails);

  const {
    name, duration, itinerary, travelStyle,
    groupType, budget, interests, estimatedPrice,
    description, bestTimeToVisit, weatherInfo, country
  } = tripData || {};


  const pillItems = [
    { text: travelStyle, bg: '!bg-pink-50 !text-pink-500' },
    { text: groupType, bg: '!bg-primary-50 !text-primary-500' },
    { text: budget, bg: '!bg-success-50 !text-success-700' },
    { text: interests, bg: '!bg-navy-50 !text-navy-500' },
  ];

  const visitTimeAndWeatherInfo = [
    { title: 'Best Time to Visit:', items: bestTimeToVisit },
    { title: 'Weather:', items: weatherInfo }
  ]


  return (
    <main className="travel-detail pt-40 wrapper">

      <div className="travel-div">
        <Link to="/" className="back-link">
          <img src="/assets/icons/arrow-left.svg" alt="back icon" />
          <span>Go back</span>
        </Link>


        <section className="container wrapper-md">

          {/* Start Header Intro Text and Pill  */}
          <header>
            <h1 className="p-40-semibold text-dark-100">{name}</h1>
            <div className="flex items-center gap-5">
              <InfoPill
                text={`${duration} day plan`}
                image="/assets/icons/calendar.svg"
              />

              <InfoPill
                text={[...new Set(itinerary?.map(item => item.location))].join(", ") || ""}
                image="/assets/icons/location-mark.svg"
              />
            </div>
          </header>

          {/* Start Chip List section  */}
          <section className="flex gap-3 md:gap-5 items-center flex-wrap">
            <ChipListComponent id="travel-chip">
              <ChipsDirective>
                {pillItems.map((pill, i) => (
                  <ChipDirective
                    key={i}
                    text={getFirstWord(pill.text)}
                    cssClass={`${pill.bg} !text-base !font-medium !px-4`}
                  />
                ))}
              </ChipsDirective>
            </ChipListComponent>

            <ul className="flex gap-1 items-center">
              {Array(5).fill('null').map((_, index) => (
                <li key={index}>
                  <img
                    src="/assets/icons/star.svg"
                    alt="star"
                    className="size-[18px]"
                  />
                </li>
              ))}

              <li className="ml-1">
                <ChipListComponent>
                  <ChipsDirective>
                    <ChipDirective
                      text="4.9/5"
                      cssClass="!bg-yellow-50 !text-yellow-700"
                    />
                  </ChipsDirective>
                </ChipListComponent>
              </li>
            </ul>
          </section>

          {/* Start Duraiton and price text section  */}
          <section className="title">
            <article>
              <h3>
                {duration}-Day {country} {travelStyle} Trip
              </h3>
              <p>{budget}, {groupType} and {interests}</p>
            </article>

            <h2>{estimatedPrice}</h2>
          </section>

          {/* Start trip Plan details Text section  */}
          <section>
            <p className="text-sm md:text-lg font-normal text-dark-400">{description}</p>

            <ul className="itinerary">
              {itinerary?.map((dayPlan: DayPlan, index: number) => (
                <li key={index}>
                  <h3>
                    Day {dayPlan.day}: {dayPlan.location}
                  </h3>

                  <ul>
                    {dayPlan.activities.map((activity, index: number) => (
                      <li key={index}>
                        <span className="flex-shring-0 p-18-semibold">{activity.time}</span>
                        <p className="flex-grow">{activity.description}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>


          {visitTimeAndWeatherInfo.map((section) => (
            <section key={section.title} className="visit">
              <div>
                <h3>{section.title}</h3>

                <ul>
                  {section.items?.map((item) => (
                    <li key={item}>
                      <p className="flex-grow">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}

          <a href={trip?.payment_link} className="flex">
            <ButtonComponent className="button-class" type="submit">
              <span className="p-16-semibold text-white">
                Pay to join the trip
              </span>
              <span className="price-pill">{estimatedPrice}</span>
            </ButtonComponent>
          </a>

        </section>

      </div>

      <section className="flex flex-col gap-6">
        <h2 className="p-24-semibold text-dark-100">Popular Trips</h2>

        <div className="trip-grid">
          {allTrips.map((trip) => (
            <Tripcard
              key={trip.id}
              id={trip.id}
              name={trip.name || "Unnamed"}
              imageUrl={trip.imageUrls[0]}
              location={trip.itinerary?.[0]?.location ?? ""}
              tags={[trip.interests!, trip.travelStyle!]}
              price={trip.estimatedPrice || "Unlisted Price"}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default TravelDetail
