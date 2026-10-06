import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { SeriesModule } from './series/series.module';
import { MusicModule } from './music/music.module';
import { PodcastsModule } from './podcasts/podcasts.module';
import { LiveModule } from './live/live.module';
import { SearchModule } from './search/search.module';
import { SocialModule } from './social/social.module';
import { ModerationModule } from './moderation/moderation.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChannelsModule } from './channels/channels.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    VideosModule,
    SeriesModule,
    MusicModule,
    PodcastsModule,
    LiveModule,
    SearchModule,
    SocialModule,
    ModerationModule,
    UploadModule,
    NotificationsModule,
    ChannelsModule,
    PlaylistsModule,
    AdminModule,
  ],
})
export class AppModule {}

