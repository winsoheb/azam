import { PrismaClient, Role, OrderStatus, PaymentStatus, DeviceStatus, DeviceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeDocument.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.message.deleteMany();
  await prisma.aIAction.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.ticket.deleteMany();
  
  await prisma.deviceEvent.deleteMany();
  await prisma.deviceAlert.deleteMany();
  await prisma.deviceTelemetry.deleteMany();
  await prisma.device.deleteMany();
  
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('Demo@123', 10);

  const admin = await prisma.user.create({
    data: { name: 'System Admin', email: 'admin@nexasupport.demo', password: passwordHash, role: Role.ADMIN },
  });

  const agent = await prisma.user.create({
    data: { name: 'Support Agent', email: 'agent@nexasupport.demo', password: passwordHash, role: Role.AGENT },
  });

  const rahul = await prisma.user.create({
    data: { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', password: passwordHash, role: Role.CUSTOMER, customerId: 'CUST-1001' },
  });

  const priya = await prisma.user.create({
    data: { name: 'Priya Patel', email: 'priya.patel@example.com', password: passwordHash, role: Role.CUSTOMER, customerId: 'CUST-1002' },
  });

  const aarav = await prisma.user.create({
    data: { name: 'Aarav Mehta', email: 'aarav.mehta@example.com', password: passwordHash, role: Role.CUSTOMER, customerId: 'CUST-1003' },
  });

  console.log('Seeding devices...');
  
  const devices = [
    {
      deviceId: 'DEV-T1001',
      name: 'NexaSense T100',
      type: DeviceType.SENSOR_TEMP_HUMIDITY,
      status: DeviceStatus.ONLINE,
      healthScore: 91,
      battery: 82,
      signal: -58,
      userId: rahul.id,
      telemetry: { temperature: 27.4, humidity: 48 },
    },
    {
      deviceId: 'DEV-T1002',
      name: 'NexaSense T100',
      type: DeviceType.SENSOR_TEMP_HUMIDITY,
      status: DeviceStatus.WARNING,
      healthScore: 74,
      battery: 67,
      signal: -61,
      userId: rahul.id,
      telemetry: { temperature: 68.2, humidity: 42 },
    },
    {
      deviceId: 'DEV-D2001',
      name: 'NexaGuard D200',
      type: DeviceType.SENSOR_DOOR,
      status: DeviceStatus.OFFLINE,
      healthScore: 32,
      battery: 8,
      signal: -93,
      userId: priya.id,
      telemetry: { doorOpen: false },
    },
    {
      deviceId: 'DEV-A3001',
      name: 'NexaAir A300',
      type: DeviceType.SENSOR_AIR_QUALITY,
      status: DeviceStatus.ONLINE,
      healthScore: 95,
      battery: 98,
      signal: -45,
      userId: aarav.id,
      telemetry: { pm25: 18, pm10: 32, co2: 620 },
    },
    {
      deviceId: 'DEV-P4001',
      name: 'NexaPower P400',
      type: DeviceType.METER_ENERGY,
      status: DeviceStatus.ONLINE,
      healthScore: 89,
      battery: 100,
      signal: -50,
      userId: rahul.id,
      telemetry: { voltage: 230, current: 4.2, power: 966 },
    },
    {
      deviceId: 'DEV-W5001',
      name: 'NexaWater W500',
      type: DeviceType.SENSOR_WATER,
      status: DeviceStatus.WARNING,
      healthScore: 71,
      battery: 45,
      signal: -75,
      userId: priya.id,
      telemetry: { waterLevel: 88 },
    },
    {
      deviceId: 'DEV-G6001',
      name: 'NexaTrack G600',
      type: DeviceType.TRACKER_GPS,
      status: DeviceStatus.ONLINE,
      healthScore: 86,
      battery: 64,
      signal: -67,
      userId: aarav.id,
      telemetry: { lat: 19.0760, lng: 72.8777 },
    },
    // Additional 3 devices
    {
      deviceId: 'DEV-T1003',
      name: 'NexaSense T100',
      type: DeviceType.SENSOR_TEMP_HUMIDITY,
      status: DeviceStatus.CRITICAL,
      healthScore: 12,
      battery: 10,
      signal: -85,
      userId: priya.id,
      telemetry: { temperature: 86.4, humidity: 20 },
    },
    {
      deviceId: 'DEV-D2002',
      name: 'NexaGuard D200',
      type: DeviceType.SENSOR_DOOR,
      status: DeviceStatus.ONLINE,
      healthScore: 98,
      battery: 95,
      signal: -50,
      userId: aarav.id,
      telemetry: { doorOpen: true },
    },
    {
      deviceId: 'DEV-P4002',
      name: 'NexaPower P400',
      type: DeviceType.METER_ENERGY,
      status: DeviceStatus.ONLINE,
      healthScore: 100,
      battery: 100,
      signal: -40,
      userId: rahul.id,
      telemetry: { voltage: 240, current: 1.1, power: 264 },
    }
  ];

  for (const d of devices) {
    const device = await prisma.device.create({
      data: {
        deviceId: d.deviceId,
        name: d.name,
        type: d.type,
        status: d.status,
        healthScore: d.healthScore,
        battery: d.battery,
        signal: d.signal,
        lastSeen: new Date(),
        userId: d.userId,
      }
    });

    // Create current telemetry
    await prisma.deviceTelemetry.create({
      data: {
        deviceId: device.id,
        payload: d.telemetry
      }
    });

    // Create some historical events for the timeline
    await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        type: 'DEVICE_REGISTERED',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    });
    
    await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        type: 'CONNECTED',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000 * 60 * 5) // 5 mins later
      }
    });

    if (d.status === DeviceStatus.WARNING || d.status === DeviceStatus.CRITICAL) {
      await prisma.deviceAlert.create({
        data: {
          deviceId: device.id,
          title: d.status === DeviceStatus.CRITICAL ? 'CRITICAL ALERT' : 'WARNING DETECTED',
          message: `An anomaly was detected on ${d.name}.`,
          severity: d.status === DeviceStatus.CRITICAL ? 'CRITICAL' : 'WARNING',
          createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
        }
      });
      
      await prisma.deviceEvent.create({
        data: {
          deviceId: device.id,
          type: 'ANOMALY_DETECTED',
          description: 'Telemetry exceeded normal thresholds',
          createdAt: new Date(Date.now() - 1000 * 60 * 30)
        }
      });
    }
  }

  console.log('Seeding knowledge base...');
  const kbs = [
    { title: 'NexaSense T100 User Manual', content: 'The NexaSense T100 is an advanced temperature and humidity sensor. Normal operating temperature is 10-60°C. If the temperature exceeds 75°C, it is considered critical and may require physical inspection.', category: 'Manual' },
    { title: 'NexaGuard D200 Installation Guide', content: 'For best results, mount the D200 on the upper corner of the door. Ensure the gap between sensor parts is less than 1cm when closed. Low battery (under 15%) can cause false offline alerts.', category: 'Installation' },
    { title: 'NexaAir A300 Troubleshooting Guide', content: 'If PM2.5 readings stay consistently high (>100) indoors, check for dust or smoke sources. To recalibrate, place the device outdoors in fresh air for 30 minutes.', category: 'Troubleshooting' },
    { title: 'NexaPower P400 User Manual', content: 'The P400 connects directly to your main breaker panel. Do not install without shutting off main power. Standard voltage ranges from 220V-240V.', category: 'Manual' },
    { title: 'NexaWater W500 Installation Guide', content: 'Mount the sensor exactly at the maximum desired water level. If it triggers falsely, clean the prongs with a dry cloth.', category: 'Installation' },
    { title: 'Device Connectivity Troubleshooting', content: 'If a device drops offline, verify the WiFi network is active. Devices require a 2.4GHz network. 5GHz networks are not supported. Signal strength (RSSI) worse than -85 dBm may cause drops.', category: 'Troubleshooting' },
    { title: 'Sensor Calibration Guide', content: 'Most sensors auto-calibrate. For manual calibration of the T100, press and hold the pairing button for 15 seconds until the LED flashes blue.', category: 'Calibration' },
    { title: 'Battery Optimization Guide', content: 'To extend battery life, reduce the reporting frequency in the app settings from every 1 minute to every 15 minutes. Cold environments drain batteries faster.', category: 'Battery' },
  ];

  for (const kb of kbs) {
    const doc = await prisma.knowledgeDocument.create({
      data: { title: kb.title, content: kb.content, category: kb.category },
    });
    await prisma.knowledgeChunk.create({
      data: { documentId: doc.id, content: kb.content },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
