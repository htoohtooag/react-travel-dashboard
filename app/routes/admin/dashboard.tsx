import { Header, StatsCard, Tripcard } from 'components'
import { getAllUsers, getUser } from '~/appwrite/auth';
import type { Route } from './+types/dashboard';
import { useRouteLoaderData } from 'react-router';
import { getTripsByTravelStyle, getUserGrowthPerDay, getUsersAndTripsStats } from '~/appwrite/dashboard';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import { Category, ChartComponent,  ColumnSeries, DataLabel, Inject, SeriesCollectionDirective, SeriesDirective, SplineAreaSeries, Tooltip } from '@syncfusion/ej2-react-charts';
import { tripXAxis, tripyAxis, userXAxis, useryAxis } from '~/constants';
import { ColumnDirective, ColumnsDirective, GridComponent } from '@syncfusion/ej2-react-grids';

export const clientLoader = async () => {
  const [
    user, 
    dashboardStats, 
    trips, 
    userGrowth, 
    tripsByTravelStyle,
    allUsers
  ] = await Promise.all([
    await getUser(),
    await getUsersAndTripsStats(),
    await getAllTrips(4,0), 
    await getUserGrowthPerDay(),
    await getTripsByTravelStyle(),
    await getAllUsers(4, 0)
  ]);

  const allTrips = trips.allTrips.map(({$id , tripDetails, imageUrls}) => ({
    id: $id, 
    ...parseTripData(tripDetails), 
    imageUrls: imageUrls ?? []
  }));

  const mappedUsers: UsersItineraryCount[] = allUsers.users.map((user) => ({
    imageUrl: user.imageUrl, 
    name: user.name, 
    count: user.itineraryCount ?? Math.floor(Math.random() * 10)
  }));


  return {
    user, 
    dashboardStats,
    allTrips, 
    userGrowth,
    tripsByTravelStyle,
    allUsers: mappedUsers
  }
  
};


const dashboard = ({loaderData}: Route.ComponentProps) => { 
  
  //=> Mehtod 1 (data loading same component can callback with loaderdata (data Loading) )
  const user = loaderData.user as User | null; 

  //?=> method 2 (with useRouteLoaderData)
  //note we have to pass the id in the routes.ts file
  //* const user = useRouteLoaderData("admin-layout") as User | null; 
  //! in that we can use the useLoaderData like in Navitems.tsx (because that componet is in the layoutcomport , that dashboard is on the child outliet com can not pass data so use "useRouteLoader")

  
  const {dashboardStats, allTrips, userGrowth, tripsByTravelStyle, allUsers} = loaderData;

  const {totalUsers, usersJoined, totalTrips, tripsCreated, userRole} = dashboardStats;

  const trips = allTrips.map((trip) => ({
    imageUrl: trip.imageUrls, 
    name: trip.name, 
    interest: trip.interests
  })); 

  type GridConfig = {
    title: string;
    dataSource: any[];
    field: string;
    headerText: string;
  };
  const usersAndTrips: GridConfig[] = [
    {
      title: "Latest user Signups", 
      dataSource: allUsers, 
      field: "count", 
      headerText: "Trips created"
    },
    {
      title: "Trips based on interests", 
      dataSource: trips, 
      field: "interest", 
      headerText: 'Interests'
    }
  ]; 

  return (
    <div className='dashboard wrapper'>

      <Header 
        title={`Weclome ${user?.name ?? "Guest"}`}
        description= "Track activity ,trends and popular destination real time"
      />

      {/* Start Stats Card  */}
      <section className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
          <StatsCard 
            headerTitle= "Total Users"
            total={totalUsers}
            currentMonthCount={usersJoined.currentMonth}
            lastMonthCount={usersJoined.lastMonth} 
          />
           <StatsCard 
            headerTitle= "Total Trips"
            total={totalTrips}
            currentMonthCount={tripsCreated.currentMonth}
            lastMonthCount={tripsCreated.lastMonth} 
          />
          <StatsCard 
            headerTitle= "Active Users"
            total={userRole.total}
            currentMonthCount={userRole.currentMonth}
            lastMonthCount={userRole.lastMonth} 
          />
        </div>
      </section>

      {/* Start trip cart  */}
      <section className='container'>
        <h1 className='text-xl font-semibold'> Created Trips</h1>
        <div className='trip-grid'>
          {allTrips.map(({id, name, imageUrls, itinerary, interests, travelStyle, estimatedPrice}) => (
            <Tripcard 
              key={id}
              id={id.toString()}
              name={name ?? "Unnamed"}
              imageUrl={imageUrls[0]}
              location={itinerary?.[0]?.location ?? ""}     
              tags={[interests!,travelStyle!]}
              price={estimatedPrice ?? "Unlisted Price"}      
              />
          ))}
        </div>
      </section>

      {/* Start Chart  */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartComponent
                    id="chart-1"
                    primaryXAxis={userXAxis}
                    primaryYAxis={useryAxis}
                    title="User Growth"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="Column"
                            name="Column" //. nmae is when hover the data popup title name
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />

                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="SplineArea"
                            name="Wave"
                            fill="rgba(71, 132, 238, 0.3)"
                            border={{ width: 2, color: '#4784EE'}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>

                <ChartComponent
                    id="chart-2"
                    primaryXAxis={tripXAxis}
                    primaryYAxis={tripyAxis}
                    title="Trip Trends"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={tripsByTravelStyle}
                            xName="travelStyle"
                            yName="count"
                            type="Column"
                            name="day" 
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
      </section>

      <section className="user-trip wrapper">
          {usersAndTrips.map(({ title, dataSource, field, headerText}, i) => (
              <div key={i} className="flex flex-col gap-5">
                  <h3 className="p-20-semibold text-dark-100">{title}</h3>

                  <GridComponent dataSource={dataSource} gridLines="None">
                      <ColumnsDirective>
                          <ColumnDirective
                              field={'name'}
                              headerText="Name"
                              width="200"
                              textAlign="Left"
                              template={(props: UserData) => (
                                  <div className="flex items-center gap-1.5 px-4">
                                      <img src={props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                      <span>{props.name}</span>
                                  </div>
                              )}
                          />

                          <ColumnDirective
                              field={field}
                              headerText={headerText}
                              width="150"
                              textAlign="Left"
                          />
                      </ColumnsDirective>
                  </GridComponent>
              </div>
          ))}
      </section>


    </div>
  )
}

export default dashboard
 

// ??  = is this missing 
// ||  = is this false / empty / zero / missing  (or) 
// &&  = Should i continue ? 

//=>  ?? = (check only null and undefined) 
// a ?? b 
// if a is "null or undefined" -> use b 
// otherwise                   -> use a  
 
//=> ||  (or) 
// a || b 
// if a is "falsy (false, 0, "", null, undefined, NaN)" -> use b 
// otherwise     -> use a

//=> Date data
// getMonth -> 0 = jan , 1 , 2...  
// new Date(year, monthIndex, datePartMatcher, hour, minute) 
// new Date(2026, 0 ,1);  //. Thu Jan 01 2026 00:00:00 GMT+0630 (Myanmar Time) 
// new Date(2026, 0, 1).toISOStirng() //. 2025-12-31T17:30:00.000Z (UTC)
// new Date(2026, 0, 0).toISOStrng() //. 2025-12-30T17:30:00.000Z  Day 0 = one day BEFORE day 1 of that month